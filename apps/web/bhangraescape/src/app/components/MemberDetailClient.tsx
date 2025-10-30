"use client"
import type { Member } from "../types/members";
import AvatarEditor from "./AvatarEditor";
type Role = "GUEST"| "ADMIN" | "MEMBER"
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function MemberDetailClient({role, member}: {role: Role, member: Member}){
    const [open, setOpen] = useState(false);
    const isAdmin = role === "ADMIN";
    const router = useRouter()
    return(
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {/* avatar */}
            <div>
                {member.avatarUrl ? (
                    <Image
                        src = {member.avatarUrl}
                        alt = {member.name}
                        width = {128}
                        height={128}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 grid place-items-center">
                        <span>NA</span>
                    </div>
                )}
                <button
                type= "button"
                className={`btn btn-outline btn-sm ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
                disabled={!isAdmin}
                onClick={()=> isAdmin && setOpen((prev)=>!prev)}
                title="Edit avatar"
                >Edit Avatar</button>
            </div>
            {open && (
                <div>
                    <AvatarEditor memberId={member.id} initialUrl={member.avatarUrl ?? ""} onClose={()=> setOpen(false)} onDone={()=>{setOpen(false); router.refresh()}}/>
                </div>
            )}
            {/* Name */}
            <h1 className="text-3xl font-bold">{member.name}</h1>
            {/* Description */}
            <p>{member.desctiption ?? "No description yet"}</p>
        </div>
    )
}