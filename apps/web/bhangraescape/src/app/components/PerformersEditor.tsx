"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "GUEST"|"MEMBER"|"ADMIN";

type EligiblePerson = {
    id: string
    name: string
    avatarUrl: string | null
    role: "MEMBER"|"ADMIN"
}

type CurrentPerformer = {
    id: string
    name: string
    avatarUrl: string | null
    description: string | null
}

export default function PerformersEditor({eventId, role, onClose, initialIds}:{initialIds: string[],eventId: string, role: Role, onClose: ()=>void}){
    const router = useRouter();
    const isAdmin = role === "ADMIN";

    const [loading, setLoading]=useState(true);
    const [saving, setSaving]=useState(false);
    const [eligible, setEligible]=useState<EligiblePerson[]>([]);
    const [selected, setSelected]=useState<Set<string>>(()=>new Set(initialIds));

    // load both lists on mount of the component.
    useEffect(()=>{
        let cancelled = false;

        async function load(){
            try{
                setLoading(true);

                   
                
                const optionRes = await fetch(`/api/admin/eligible-performers`, {cache: "no-store"})
                if(!optionRes.ok) throw new Error("failed to fetch eligible performers");

                const optionJson = (await optionRes.json()) as {items: EligiblePerson[]};
              

                if(cancelled) return;
                setEligible(optionJson.items ?? []);
            }catch(e){
                console.log(e)
            }finally{
                if(!cancelled) setLoading(false);
            }
        }

        load();
        return ()=>{
            cancelled=true;
        }
    },[eventId])

    function toggle(id: string){
       setSelected((prev)=>{
        const next = new Set(prev);
        if(next.has(id)) next.delete(id)
            else next.add(id)
            return next;
       })
       
    }

    // save function
    async function onSave(){
        if(saving) return;
        setSaving(true);
        try{
            const userIds = Array.from(selected);
            const res = await fetch(`/api/events/${eventId}/performers`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({userIds})
            })
            if(!res.ok){
                const t = await res.text();
                throw new Error(`Save failed ${res.status} ${t}`)
            }
            router.refresh();
            onClose?.();
        }catch(err){
            console.log(err)
        }finally{
            setSaving(false);
        }
    }

    async function onClearAll() {
    if (!isAdmin || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/performers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [] }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Clear failed: ${res.status} ${res.statusText} — ${t}`);
      }
      setSelected(new Set());
      router.refresh();
      onClose?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const disabled = !isAdmin || loading || saving;

  return (
    <div className="space-y-3">
        <div>
            <strong>Select Performers</strong>
        </div>

        <ul className="space-y-2">
            {
                eligible.map((item)=>{
                    const isChecked = selected.has(item.id);
                    return(
                        <li key={item.id} className="flex items-center gap-2">
                            <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isAdmin}
                            onChange={()=>toggle(item.id)}
                            />
                            <span>{item.name}</span>
                            {
                                item.role == "ADMIN" ? (<span className="text-xs opacity-70">(admin)</span>) : null
                            }
                        </li>
                    )
                })
            }
        </ul>

        <div className="flex gap-2">
            <button onClick={onSave} disabled={disabled}>{saving? "Saving": "Save"}</button>
            <button onClick={onClearAll} disabled={disabled}>
          Clear all
        </button>
       <button type="button" onClick={onClose} disabled={saving}>
          Cancel
        </button>
        </div>
    </div>
  )
}

