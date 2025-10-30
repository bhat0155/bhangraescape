"use client"
import { useState } from "react"
import { useRouter } from "next/navigation";


export default function DeleteMemberButton({memberId}: {memberId: string}){
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const router = useRouter()

  async  function handleDelete(){
    setDeleting(true)
    console.log("DELETE clicked")
        try{
            const res = await fetch(`/api/members/${memberId}`, {
            method: "DELETE",
                headers: {
            "Content-Type": "application/json",
            },
    
        })

        if(!res.ok){
            const text = await res.text();
            throw new Error(`Cannot delete member ${text}`)
        }
        router.push("/members")
        }catch(err){
            setError(`${err}`)
        }
        finally{
            setDeleting(false)
        }
    }

    return(
        <button
        onClick={handleDelete}
        >
            Delete
        </button>
    )
}