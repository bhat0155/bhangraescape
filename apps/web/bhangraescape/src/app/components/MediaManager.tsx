"use client";
import { useState } from "react";
import MediaGrid from "./MediaGrid";
import type { MediaItem } from "../types/media";
import { formatBytes } from "../utils/common";
import { getExt } from "../utils/common";


type Role = "GUEST" | "MEMBER" | "ADMIN";

type Props = {
  eventId: string;
  role: Role;
  initialMedia: MediaItem[];
  token: string | null;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB


type UploadStatus = "IDLE" | "READY" | "PRESIGNING" | "UPLOADING" | "REGISTERING" | "FAILED";

type PresignResponse = {
    url: string;
    fields: Record<string,string>;
    key: string;
    publicUrl: string;
    expiresIn: number;
}

type UploadState = {
  file: File | null;
  kind: "IMAGE" | "VIDEO" | null;
  status: UploadStatus;
  errorMessage: string | null;
  presign?: PresignResponse
};


// function for direct s3 upload
async function directS3Upload(presign: PresignResponse, file: File){
    // build formdata which would be send to s3
    const form = new FormData();

    // make key value pairs of form fields
    Object.entries(presign.fields).forEach(([k,v])=> form.append(k,v));

    // append to file key
    form.append("file", file)

    // post to s3
    const resS3 = await fetch(presign.url, {
        method: "POST",
        body: form
    })

    // s3 returns 204 on success
    if(resS3.status !=204){
        const errorText = await resS3.text().catch((err)=>console.log(err));
        console.log(errorText)
        throw new Error(`Direct S3 upload failed. Status ${resS3.status}. ${resS3 || ""}`.trim())
    }
}

export default function MediaManager({ eventId, role, initialMedia, token }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [showUploader, setShowUploader] = useState(false);
  const [title, setTitle] = useState<string>("");
  const isAdmin = role === "ADMIN";

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    kind: null,
    status: "IDLE",
    errorMessage: null,
  });

  async function handleUploadStart(){
    if(role !== "ADMIN") return;
    if(!uploadState.file || uploadState.status !== "READY") return;

    try{
        // flip UI to presigning
        setUploadState((s)=>({
            ...s,
            status: "PRESIGNING",
            errorMessage: null
        }))

        // prepare metadata for backend
        const contentType = uploadState.file.type;
        const ext = getExt(uploadState.file.name);
        const payload = {
            prefix: "events",
            contentType,
            ext,
             maxSizeMb: 100, 
        }

        // calling the s3 endpoint
        const res = await fetch(`/api/uploads/events/${eventId}/media/presign`,{
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(payload)
        });

        if(!res.ok){
            const t = await res.text();
            throw new Error(`Presign failed: ${res.status} ${res.statusText} - ${t}`)
        }

        // if everything good, stash presign and change the status
        const presign = (await res.json()) as PresignResponse;

        setUploadState((s)=>({
            ...s,
            status: "UPLOADING",
            presign,
            errorMessage: null
        }))

        // uploading to s3
        try{
            await directS3Upload(presign, uploadState.file)

             setUploadState((s)=> ({
                ...s,
                status: "REGISTERING",
                errorMessage: null
            }))

            // register to db
            const providedTitle = title.trim() ?? "media";

            // authenticated post req to store inside db
            const newItem = await registerUploadedMedia({eventId, token, url: presign.url, kind: uploadState.kind!, title: providedTitle, key: presign.key})

            // change state variable
            setMedia((prev)=> [newItem, ...prev])

            // reset state and close uploader
            setUploadState({file: null, kind: null, status:"IDLE", errorMessage: null})
            setTitle("");
            setShowUploader(false)

        }catch(err){
            console.log(err)
            setUploadState((s)=> ({
                ...s,
                status: "FAILED",
                errorMessage: "Direct S3 upload failed. Please refresh page and try again.",
            }))
        }

    }catch(err){
        console.log(err);
        setUploadState((s)=>({
            ...s,
            status: "FAILED",
            errorMessage: "Could not get S3 permissions. Please try again"
        }))
    }
  }

  async function registerUploadedMedia(opts: {
    eventId: string,
    token: string | null,
    url: string,
    kind: "IMAGE"|"VIDEO",
    title?: string|null,
    key: string
  }): Promise<MediaItem>{
    const res = await fetch(`/api/uploads/events/${opts.eventId}/media`,{
        method: "POST",
        headers:  {
        "Content-Type": "application/json",
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: JSON.stringify({
        fileKey: opts.key,
        type: opts.kind,
        title: opts.title
      })
    })

    if(!res.ok){
         const t = await res.text().catch(() => "");
       throw new Error(`DB register failed: ${res.status} ${res.statusText} — ${t}`);
    }

    const json = (await res.json()) as MediaItem;
    return json
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setUploadState({ file: null, kind: null, status: "IDLE", errorMessage: null });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadState({
        file: null,
        kind: null,
        status: "FAILED",
        errorMessage: `File too large. Max allowed is ${formatBytes(MAX_FILE_SIZE)}.`,
      });
      e.currentTarget.value = "";
      return;
    }

    const mime = file.type || "";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      setUploadState({
        file: null,
        kind: null,
        status: "FAILED",
        errorMessage: "Unsupported file type. Please choose an image or a video.",
      });
      e.currentTarget.value = "";
      return;
    }

    setUploadState({
      file,
      kind: isImage ? "IMAGE" : "VIDEO",
      status: "READY",
      errorMessage: null,
    });
  }

  async function handleDeleteMedia(media: MediaItem){
    if(!isAdmin || !token) return;
    try{
        const res = await fetch(`/api/uploads/media/${media.id}`, {
            method: "DELETE",
            headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        });
        if(!res.ok){
            throw new Error(`Delete failed ${res.status}`);

        }
        if(res.ok){
            setMedia((prev)=> prev.filter((item)=> item.id != media.id))
        }
        console.log(` Media ${media.title} deleted successfully.`);

    }catch(err){
        console.log(err)
        throw new Error(`Failed to delete media: ${err}`)
    }
  }

  return (
    <section className="space-y-4">
      {/* Header row */}
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Videos &amp; Photos</h2>

        {/* visible to everyone; disabled for non-admins with tooltip */}
        <div className="relative inline-flex group">
          <button
            type="button"
            className={`btn btn-primary btn-sm px-4 py-2 ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
            disabled={!isAdmin}
            onClick={() => isAdmin && setShowUploader((v) => !v)}
            aria-expanded={showUploader}
            aria-controls="media-uploader"
            title={isAdmin ? "Add media to this event" : "Only admins can add media"}
          >
            {showUploader ? "Close" : "+ Add"}
          </button>

          {!isAdmin && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                         hidden group-hover:flex items-center gap-2
                         bg-base-100 text-base-content text-sm font-medium
                         border border-base-300 rounded-lg shadow-lg
                         px-3 py-2 z-10 whitespace-nowrap"
              role="note"
            >
              <span role="img" aria-label="forbidden" className="text-error">
                🚫
              </span>
              Only admins can add media
            </div>
          )}
        </div>
      </header>
     

      {/* Uploader */}
      {showUploader && (
        
        <div
          id="media-uploader"
          className="rounded-xl bg-base-100 border border-base-300 p-4 shadow-sm space-y-3"
        >
          <div className="text-xs opacity-70">Max file size: {formatBytes(MAX_FILE_SIZE)}</div>
           <div className="max-w-md">
            <label htmlFor="media-title" className="block text-sm font-medium mb-1">
                Title
                <span className="text-error ml-1">*</span> 
            </label>
            <input
            type="text"
            className="input input-bordered input-sm w-full"
            placeholder="e.g., Group pose, Crown lift, Full routine"
            onChange={(ev)=> setTitle(ev.target.value)}
            disabled={uploadState.status === "PRESIGNING" || uploadState.status === "UPLOADING"}
             >
            </input>
          </div>

          {/* dashed dropzone look (click to open) */}
          <label
            htmlFor="media-file"
            className={`w-full rounded-lg border-2 border-dashed p-6 grid place-items-center
                        cursor-pointer transition
                        ${uploadState.status === "FAILED" ? "border-error/60 bg-error/10" : "border-base-300 hover:border-primary/60 hover:bg-base-200/40"}`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-sm font-medium">
                {uploadState.file ? "Change file" : "Click to choose a file"}
              </span>
              <span className="text-xs opacity-70">Images or Videos</span>
            </div>
          </label>
          <input
            id="media-file"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* feedback block */}
          <div className="text-sm">
            {uploadState.status === "IDLE" && (
              <div className="badge badge-ghost">No file selected</div>
            )}

            {uploadState.status === "READY" && uploadState.file && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-outline">{uploadState.kind}</span>
                <span className="badge badge-ghost">{formatBytes(uploadState.file.size)}</span>
                <span className="truncate max-w-[60ch]">{uploadState.file.name}</span>
              </div>
            )}

            {uploadState.status === "FAILED" && (
              <div className="alert alert-error mt-2">
                <span>Invalid file: {uploadState.errorMessage}</span>
              </div>
            )}
          </div>

         

          {/* actions */}
<div className="flex items-center gap-2 pt-1">
  {/* Upload (primary indigo) */}
  <button
    type="button"
    className="btn btn-primary btn-sm"
    onClick={handleUploadStart}
    disabled={
      !isAdmin ||
      !uploadState.file ||
      uploadState.status !== "READY"
    }
    title="Upload"
  >
    Upload
  </button>

  {/* Clear (same hue, outlined) */}
            <button
                type="button"
                className="btn btn-outline btn-primary btn-sm"
                onClick={() =>
                setUploadState({
                    file: null,
                    kind: null,
                    status: "IDLE",
                    errorMessage: null,
                    presign: undefined,
                })
                }
                disabled={uploadState.status === "PRESIGNING"}
                title="Clear selected file"
            >
                Clear
            </button>
            </div>
        </div>
      )}

      
    {uploadState.status === "PRESIGNING" && (
    <div className="text-sm opacity-80">Requesting S3 permission…</div>
    )}
    {uploadState.status === "UPLOADING" && (
  <div className="text-sm opacity-80">Uploading to S3…</div>
)}
      {/* Media grid */}
     <MediaGrid
  items={media.map((m) => ({
    ...m,
    canEdit: isAdmin && showUploader,            
    onDelete: isAdmin && showUploader
      ? () => handleDeleteMedia(m)               
      : undefined,
  }))}
/>
    </section>
  );
}
