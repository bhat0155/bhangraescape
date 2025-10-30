"use client";

import { useState } from "react";
import { formatBytes } from "../utils/common";
import { getExt } from "../utils/common";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 mb
type UploadStep = "IDLE" | "READY" | "PRESIGNING" | "UPLOADING" | "PATCHING" | "FAILED";


export default function AvatarEditorUrl({
  memberId,
  initialName,
  initialDescription,
  onClose,
  onDone,
}: {
  memberId: string;
  initialName: string;
  initialDescription: string
  onClose: () => void; // called when user cancels
  onDone: () => void;  // called after successful save
}) {
  // upload from machine
  const [file, setFile] = useState<File|null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>("IDLE");
  const [uploadError, setUploadError] = useState<string|null>(null);

  // states for description and name
  const [name, setName] = useState(initialName);
  const [description, setDescription]=useState(initialDescription)
  const [saving, setSaving]=useState(false)
  const [textError, setTextError]=useState<string|null>(null)

  async function handleSave(){
     setTextError(null);
     const nm = name.trim();
     const dsc = description.trim();

     if(!nm && !dsc){
      setTextError("Nothing to update, please provide either name or description");
      return;
     }

     setSaving(true)
     try{
        const body: Record<string, string> = {}
        if(nm) body.name = nm;
        if(dsc) body.description = dsc;

        const res = await fetch(`/api/members/${memberId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        })
        if(!res.ok){
          const text = await res.text().catch((err)=>"");
          throw new Error(`Save failed: ${text}`)
        }
        onDone()
     }catch(err){
        setTextError(`${err?.message || "Cannot update name and description"}`)
     }finally{
      setSaving(false)
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

      {/* file picker from machine */}
      <div className="mt-3 space-y-2">
        <label htmlFor="avatar-file" className="block text-sm font-medium">
         Upload an Image
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

      {/* name and description */}
      <div>
        <label className="block text-sm font-medium">Name: </label>
      <input
      type="text"
      onChange={(ev)=> setName(ev.target.value)}
      value={name}
      placeholder="Make changes to name..."
      className="input input-bordered w-full"
       disabled={saving}
      ></input>
      </div>

      <div>
        <label className="block text-sm font-medium">Description: </label>
      <input
      type="text"
      onChange={(ev)=> setDescription(ev.target.value)}
      value={description}
      placeholder="Make changes to description..."
      className="input input-bordered w-full"
       disabled={saving}
      ></input>
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
            "Upload Image"
          }
        </button>

        {/* save */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          title="Save"
        >
          {saving ? "Saving…" : "Save (name and description)"}
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