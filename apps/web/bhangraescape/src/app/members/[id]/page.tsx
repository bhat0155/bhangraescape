import { notFound } from "next/navigation";
import type { Member } from "@/app/types/members";
import Image from "next/image";

export default async function MemberDetailPage({params}: {params: {id: string}}){
    const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    // fetch via proxy
    const res = await fetch(`${BASE}/api/members/${params.id}`, {cache: "no-store"});

    if (res.status === 404) notFound();

    if(!res.ok){
        throw new Error(`Failed to load member: ${res.status} ${res.statusText}`)
    }

    const member = (await res.json()) as Member;

    return (
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
            </div>
            {/* Name */}
            <h1 className="text-3xl font-bold">{member.name}</h1>
            {/* Description */}
            <p>{member.desctiption ?? "No description yet"}</p>
        </div>
    )
}