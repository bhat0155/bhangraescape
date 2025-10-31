"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function FinalMixEditor({eventId, initialTitle, initialUrl}: {eventId: string, initialTitle:string, initialUrl: string}){
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(initialTitle)
    const [url, setUrl]=useState(initialUrl)
    const [saving, setSaving]=useState(false);
    const [error, setError]=useState<string|null>(null);

    // reject bad url before hitting backend
    function looksLikeUrl(v: string){
        try{
            new URL(v);
            return true
        }catch{
            return false
        }
    }

    async function handleSave(){
        setError(null)
        const t = title.trim();
        const u = url.trim();

        if(!u) {
            setError("Please enter a Url")
            return;
        }
        if(!looksLikeUrl(u)){
             setError("Please enter a valid Url")
            return;
        }

        setSaving(true)

        try{
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    finalPlaylistTitle: t || null,
                    finalPlaylistUrl: u
                })

            })
            if(!res.ok){
                const text = await res.text();
                throw new Error(text || `Update failed `)
            }
            setOpen(false);
            router.refresh()
        }catch(err){
            setError(`Cannot update url ${err}`)
        }finally {
            setSaving(false)
        }
    }
    return(
        <div>
            <button 
            onClick={()=> setOpen((prev)=> !prev)}
            >
                Edit
            </button>
            {open && <div>
                {/* title */}
               <label htmlFor="title">Title: </label>
               <input
               type="text"
               disabled={saving}
               onChange={(ev)=>{setTitle(ev.target.value)}}
               value={title}
               ></input>
    {/* Description */}
               <label htmlFor="title">URL: </label>
               <input
               type="text"
               disabled={saving}
               onChange={(ev)=>{setUrl(ev.target.value)}}
               value={url}
               ></input>
                </div>}

                {/* save button */}
                <button
                disabled={saving}
                onClick={handleSave}
                >Save</button>

                {error && <div>{error}</div>}
        </div>
    )
}