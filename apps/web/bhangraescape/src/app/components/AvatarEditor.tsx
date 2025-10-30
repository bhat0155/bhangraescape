// app/members/[id]/components/AvatarEditorUrl.tsx (CLIENT)
"use client";

import { useState } from "react";
import { formatBytes } from "../utils/common";
import { getExt } from "../utils/common";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 mb
type UploadStep = "IDLE" | "READY" | "PRESIGNING" | "UPLOADING" | "PATCHING" | "FAILED";


export default function AvatarEditorUrl({
  memberId,
  initialUrl,
  onClose,
  onDone,
}: {
  memberId: string;
  initialUrl: string;
  onClose: () => void; // called when user cancels
  onDone: () => void;  // called after successful save
}) {
  // upload direct url
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // upload from machine
  const [file, setFile] = useState<File|null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>("IDLE");
  const [uploadError, setUploadError] = useState<string|null>(null);


  // tiny client guard: very light URL check
  function looksLikeUrl(str: string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setError(null);

    // 1) basic client checks
    if (!url.trim()) {
      setError("Please enter an image URL.");
      return;
    }
    if (!looksLikeUrl(url.trim())) {
      setError("That doesn't look like a valid URL.");
      return;
    }

    setSaving(true);
    try {
      // 2) call our PATCH proxy
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url.trim() }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Save failed: ${res.status} ${t}`);
      }

      // 3) success → tell parent to close + refresh
      onDone();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save avatar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadAndPatch(){
    if(!file) return;
    setUploadError(null);

    try{
      // presign
      setUploadStep("PRESIGNING");
      const contentType = file.type;
      const ext = getExt(file.name)
      const presignRes = await fetch(`/api/uploads/${memberId}/avatar/presign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          prefix: "avatars",
          contentType,
          ext 
        })
      })
      if(!presignRes.ok){
        const t = await presignRes.text().catch(()=> "");
        throw new Error(`Presign failed ${t || presignRes.statusText}`)
      }

      const presign = await presignRes.json() as {
        url: string,
        fields: Record<string, string>,
        key: string,
        publicUrl: string
      }

      // creating formdata and uploading to s3
      setUploadStep("UPLOADING");
      const form = new FormData();
      Object.entries(presign.fields).forEach(([k,v])=> form.append(k,v))
      form.append("file", file);
      const s3Res = await fetch(`${presign.url}`, {method: "POST", body: form})

      if(!s3Res.ok){
        const text = await s3Res.text().catch(()=>"");
        throw new Error(`S3 upload fail ${text || s3Res.statusText}`)
      }

      // patch the new avatarUrl
      setUploadStep("PATCHING");
      const patchRes = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({avatarUrl: presign.publicUrl})
      })
      if (!patchRes.ok) {
      const t = await patchRes.text().catch(() => "");
      throw new Error(`Save failed: ${t || patchRes.statusText}`);
    }

    // success
    onDone();

    }catch(err){
      console.log(err)
      setUploadStep("FAILED")
      setUploadError(err?.message || "Failed to save the avatar")
    }
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div>
        <label htmlFor="avatar-url" className="block text-sm font-medium">
          Avatar URL
        </label>
        <input
          id="avatar-url"
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered w-full"
          disabled={saving}
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* file picker from machine */}
      <div className="mt-3 space-y-2">
        <label htmlFor="avatar-file" className="block text-sm font-medium">
          or upload a new image
        </label>
        <input
        type="file"
        accept="image/*"
        disabled={saving || uploadStep === "PRESIGNING" || uploadStep === "UPLOADING" || uploadStep === "PATCHING"}
        onChange={(ev)=>{
          setUploadError(null);
          const f = ev.currentTarget.files?.[0] ?? null;
          if(!f){
            setFile(null);
            setUploadStep("IDLE")
            return
          }
          if(!f.type.startsWith("image/")){
            setFile(null);
            setUploadStep("FAILED");
            setUploadError("Please choose an image file");
            ev.currentTarget.value = ""
            return
          }
          if(f.size > MAX_FILE_SIZE){
            setFile(null);
            setUploadStep("FAILED");
            setUploadError("File is too large");
            ev.currentTarget.value = ""
            return
          }
          setFile(f);
          setUploadStep("READY")
        }}
        >
        </input>

        {file && uploadStep!=="FAILED" && (
          <div className="text-xs opacity-70">
            <strong>{file.name}: {formatBytes(file.size)}</strong>
          </div>
        )}
        {uploadError && <div className="text-sm text-red-600">{uploadError}</div>}
      </div>

      {/* Buttons */}
  
      <div className="flex items-center gap-6">

        {/* upload */}
        <button
        type="button"
        onClick={handleUploadAndPatch}
        className="btn btn-primary btn-sm"
        disabled={!file || uploadStep !=="READY" || saving}
        title="Upload image and save avatar"
        >
          {
            uploadStep == "PRESIGNING" ? "presigning" :
            uploadStep == "UPLOADING" ? "uploading" :
            uploadStep == "PATCHING" ? "patching" :
            "Upload and Save"
          }
        </button>

        {/* save */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          title="Save avatar URL"
        >
          {saving ? "Saving…" : "Save (for url)"}
        </button>

        {/* cancel */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          disabled={saving}
          title="Cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}