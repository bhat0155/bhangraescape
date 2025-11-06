"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";


export default function AddMemberModal({onClose}: {onClose: () => void}){
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [email, setEmail]=useState("")
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const router = useRouter()
    

    async function handleSave(){
        const body: Record<string, string> = {};
        const nm = name.trim();
        const dsc = description.trim();
        const em = email.trim().toLowerCase();

        if(!nm || !dsc || !em){
            setError("Name, Email and desciption are mandatory attributes");
            return;
        }
        if(nm) body.name = nm;
        if (dsc) body.description = dsc
        if (em) body.email = em;
        body.avatarUrl = "https://placehold.co/100x100"
        setSaving(true)

        try{
            const res = await fetch(`/api/members`,{
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })
            await res.json();
            router.refresh()
            onClose()
            
        }catch(err){
            setError(`Error creating member : ${err}`)
        }finally{
            setSaving(false)
        }
    }

    return (
    <div className="modal modal-open">
      <div className="modal-box space-y-3">
        <h3 className="font-bold text-lg">New member</h3>

        <label className="block text-sm">Name</label>
        <input className="input input-bordered w-full" value={name} onChange={(e)=>setName(e.target.value)} disabled={saving} />

         <label className="block text-sm">Email</label>
        <input className="input input-bordered w-full" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={saving} />

        <label className="block text-sm">Description</label>
        <textarea className="textarea textarea-bordered w-full" value={description} onChange={(e)=>setDescription(e.target.value)} disabled={saving} />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>Save</button>
        </div>
      </div>
    </div>
  );
}