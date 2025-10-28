"use client"
import { useState } from "react";
import MediaGrid from "./MediaGrid";
import type { MediaItem } from "../types/media";

type Role = "GUEST" | "MEMBER" | "ADMIN";

type Props = {
  eventId: string;
  role: Role;                  
  initialMedia: MediaItem[];
};

const MAX_FILE_SIZE = 60 * 1024 * 1024; // only upto 60 mb files allowed

// function to show file storage to user
function formatBytes(n: number){
    if(!Number.isFinite(n)) return "0 B";
    const units = ["B", "KB", "MB", "GB"];

    let i =0;
    let v = n;

    while (v>= 1024 && i < units.length - 1){
        v/=1024;
        i++
    }
    return `${v.toFixed(1)} ${units[i]}`;
}

type UploadStatus = "IDLE" | "READY" | "FAILED";

type uploadState = {
    file: File | null,
    kind: "IMAGE" | "VIDEO" | null,
    status: UploadStatus,
    errorMessage: string | null
}



export default function MediaManager({ eventId, role, initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [showUploader, setShowUploader] = useState(false);
  const isAdmin = role === "ADMIN";

  const [uploadState, setUploadState] = useState<uploadState>({
    file: null,
    kind: null,
    status: "IDLE",
    errorMessage: null
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
    // upload one file at a time
    const file = e.target.files?.[0] ?? null;

    if(!file){
        setUploadState({
            file: null,
            kind: null,
            status: "IDLE",
            errorMessage: null
        })
        return;
    }

    // size check
    if(file?.size > MAX_FILE_SIZE){
        setUploadState({
            file: null,
            kind: null,
            status: "FAILED",
            errorMessage: `File too large, max allowed is ${formatBytes(MAX_FILE_SIZE)}`
        })
        e.currentTarget.value = "";
        return

    }

    // type check
    const mime = file?.type || null;
    const isImage = mime?.startsWith("image/");
    const isVideo = mime?.startsWith("video/");

    if(!isImage && !isVideo){
        setUploadState({
            file: null,
            kind: null,
            status: "FAILED",
            errorMessage: `Unsupported file type. Please choose an image or a video`
        })
         e.currentTarget.value = "";
        return
    }

    // if all good, turn the status to READY
     setUploadState({
            file,
            kind: isImage? "IMAGE":"VIDEO",
            status: "READY",
            errorMessage: null
        })
  }

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Videos &amp; Photos</h2>

        {/* Wrapper must be relative + group so the tooltip can anchor and show on hover */}
        <div className="relative group">
          <button
            type="button"
            className={`btn btn-primary btn-sm ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
            disabled={!isAdmin}
            onClick={() => isAdmin && setShowUploader((prev) => !prev)}
            aria-expanded={showUploader}
            aria-controls="media-uploader"
            title={isAdmin ? "Add media to this event" : "Only admins can add media"}
          >
            {showUploader ? "Close" : "+ Add"}
          </button>

          {/* Hover tooltip for non-admins */}
          {!isAdmin && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                         hidden group-hover:flex items-center gap-2
                         bg-white text-gray-700 text-sm font-medium
                         border border-gray-200 rounded-lg shadow-lg
                         px-3 py-2 z-10 whitespace-nowrap"
              role="note"
            >
              <span role="img" aria-label="forbidden" className="text-red-500">🚫</span>
              Only admins can add media
            </div>
          )}
        </div>
      </header>

      {/* Uploader container (we'll fill in next steps) */}
      
      {showUploader && isAdmin && (
        <div id="media-uploader" className="rounded-lg border border-base-300 p-3">
            {/* file picker and presign upload comes here */}
            <div className="text-sm opacity-70">Max file size {formatBytes(MAX_FILE_SIZE)}</div>
            <input
            type="file"
            accept="image/*, video/*"
            onChange={handleFileChange}
            >
            </input>
        </div>
      )}
{/* Feedback */}
      <div aria-live="polite">
        {uploadState.status ===  "IDLE" && <p>No file selected</p>}
        {uploadState.status === "READY" && uploadState.file && (
            <p>
                <strong>name : {uploadState.file.name}</strong>
                <strong>size : {formatBytes(uploadState.file.size)}</strong>
                <strong>kind: {uploadState.kind == "IMAGE" ? "Image" : "Video"}</strong>
            </p>
        )}
        {/* Error handling */}
        {uploadState.status === "FAILED" && (
            <strong>Invalid file : {uploadState.errorMessage}</strong>
        )}
      </div>
      <MediaGrid items={media} />
    </section>
  );
}