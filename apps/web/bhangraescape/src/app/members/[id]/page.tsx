import { notFound } from "next/navigation";
import type { Member } from "@/app/types/members";
import Image from "next/image";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import MemberDetailClient from "@/app/components/MemberDetailClient";
import DeleteMemberButton from "@/app/components/DeleteMemberButton";

export default async function MemberDetailPage({params}: {params: {id: string}}){
    const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // fetch via proxy
    const res = await fetch(`${BASE}/api/members/${params.id}`, {cache: "no-store"});

    if (res.status === 404) notFound();

    if(!res.ok){
        throw new Error(`Failed to load member: ${res.status} ${res.statusText}`)
    }

    const member = (await res.json()) as Member;

    const session = await auth();
    const role = ((session?.user as any)?.role ?? "GUEST") as "GUEST" | "MEMBER" | "ADMIN";
    const isAdmin = role === "ADMIN"

    return (
       <div>
         <MemberDetailClient role={role} member={member}/>
       {isAdmin &&   <DeleteMemberButton memberId = {member.id}/>}
       </div>
    )
}