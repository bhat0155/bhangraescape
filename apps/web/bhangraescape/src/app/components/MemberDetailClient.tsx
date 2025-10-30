// app/members/[id]/MemberDetailClient.tsx (CLIENT)
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Member } from "@/app/types/members";
import AvatarEditor from "./AvatarEditor";

type Role = "GUEST" | "MEMBER" | "ADMIN";

export default function MemberDetailClient({ member, role }: { member: Member; role: Role }) {
  const router = useRouter();
  const isAdmin = role === "ADMIN";
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Avatar row with an Edit button */}
      <div className="flex items-start gap-4">
        {member.avatarUrl ? (
          // If you use next/image, make sure the host is allowed in next.config images.domains
          <Image
            src={member.avatarUrl}
            alt={member.name}
            width={128}
            height={128}
            className="rounded-full"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 grid place-items-center">
            <span>NA</span>
          </div>
        )}

        <div className="relative group">
          <button
            type="button"
            className={`btn btn-outline btn-sm ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
            disabled={!isAdmin}
            onClick={() => isAdmin && setOpen(true)}
            title={isAdmin ? "Edit avatar" : "Only admins can edit"}
          >
            Edit avatar
          </button>

          {/* Optional: tooltip for non-admins on hover */}
          {!isAdmin && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex items-center gap-2 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg shadow-lg px-3 py-2 z-10 whitespace-nowrap">
              <span role="img" aria-label="forbidden" className="text-red-500">🚫</span>
              Only admins can edit
            </div>
          )}
        </div>
      </div>

      {/* Name & Description (read-only for now) */}
      <h1 className="text-3xl font-bold">{member.name}</h1>
      <p>{member.description ?? "No description yet."}</p>

      {/* Editor: render when open */}
      {open && (
        <div className="mt-4">
          <AvatarEditor
            memberId={member.id}
            initialName={member.name}
            initialDescription={member.description ?? ""}
            onClose={() => setOpen(false)}                 
            onDone={() => { setOpen(false); router.refresh(); }} 
          />
        </div>
      )}
    </div>
  );
}