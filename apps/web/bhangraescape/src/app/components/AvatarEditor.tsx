"use client"
import { useState } from "react";

export default function AvatarEditor({memberId, initialUrl, onClose, onDone}: {memberId: string, initialUrl: string, onClose: ()=> void, onDone: ()=> void}){
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving]=useState(false);
  const [error, setError]=useState<string|null>(null)

 async function handleSave(){
    setError(null)
    if(!url.trim()){
        setError("please select valid url");
        return;
    }
    setSaving(true)
    try{
        const res = await fetch(`/api/members/${memberId}`,{
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({avatarUrl: url.trim()})
        })
        if(!res.ok){
            throw new Error("Cannot save the updated url")
        }
        onDone()
    }catch(err){
        console.log(err)
      setError(err?.message ?? "Failed to save avatar.");
    }finally{
        setSaving(false)
    }

  }
    return(
        <div className="rounded-lg border p-3 space-y-2">
            <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium">
                    Avatar Url
                </label>
                <input
                type="text"
                onChange={(ev)=> setUrl(ev.target.value)}
                 placeholder="https://example.com/photo.jpg"
                 value={url}
                  className="input input-bordered w-full"
                disabled={saving}
                ></input>
            </div>
      {error && <div className="text-sm text-red-600">{error}</div>}

            <button
            type="button"
            onClick={handleSave}
            disabled={saving}
              className="btn btn-primary btn-sm"
              title="saving avatar url"
            >
                Save
            </button>

            <button
            type="button"
            onClick={onClose}
            disabled={saving}
              className="btn btn-primary btn-sm"
              title="cancel"
            >
                Cancel
            </button>
        </div>
    )
}