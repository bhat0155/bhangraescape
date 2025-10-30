"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";


export default function AddMemberModal({onClose}: {onClose: () => void}){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const router = useRouter()
    

    async function handleSave(){
        const body: Record<string, string> = {};
        const nm = name.trim();
        const dsc = description.trim();

        if(!nm || !dsc){
            setError("Name and desciption are mandatory attributes");
            return;
        }
        if(nm) body.name = nm;
        if (dsc) body.description = dsc
        body.avatarUrl = "https://placehold.co/100x100"
        setSaving(true)

        try{
            const res = await fetch(`/api/members`,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })
            const created = res.json();
            router.refresh()
            
        }catch(err){
            setError(`Error creating member : ${err}`)
        }finally{
            setSaving(false)
        }
    }

    return(
        <div>
            <label htmlFor="name">Name</label>
            <input
            type="text"
            value={name}
            onChange={(ev)=> setName(ev.target.value)}
            ></input>

             <label htmlFor="description">Description</label>
            <textarea
            value={description}
            onChange={(ev)=> setDescription(ev.target.value)}
            ></textarea>

            <button
            onClick={handleSave}
            disabled={saving}
            >Save</button>

             <button
            onClick={onClose}
            disabled={saving}
            >cancel</button>
        </div>
    )
}