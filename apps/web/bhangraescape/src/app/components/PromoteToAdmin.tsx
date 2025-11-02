"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PromoteToAdmin({memberId, memberRole}: {memberId: string, memberRole: boolean}){
    const router =useRouter();
    const [saving, setSaving]=useState(false);
    const [error, setError]=useState<string|null>(null);
    console.log({memberRole})

    async function handleClick(){
        setError(null);
        setSaving(true);
        try{
            const res = await fetch(`/api/members/${memberId}/role`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({"role": "ADMIN"})
            })
            if(!res.ok){
                throw new Error("Issues promoting to admin on api side")
            }

            router.refresh()
        }catch(err){
            setError(`Cannot promote member to admin ${err}`)
        }finally{
            setSaving(false)
        }
    }

    return (
        !memberRole &&
        (<div>
            <button
            disabled={saving}
            onClick={handleClick}
            >
                {saving ? "saving" : "Promote to Admin"}
            </button>
            {error && <div>{error}</div>}
        </div>)
    )
}