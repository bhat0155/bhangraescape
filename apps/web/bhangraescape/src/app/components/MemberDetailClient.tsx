"use client";

import { useState } from "react";
import type { Member } from "@/app/types/members";
import { useRouter } from "next/navigation";
import AvatarEditor from "./AvatarEditor";
import PromoteToAdmin from "./PromoteToAdmin";

type Role = "GUEST" | "MEMBER" | "ADMIN";

export default function MemberDetailClient({
  member,
  role,
}: {
  member: Member;
  role: Role;
}) {
  const router = useRouter();
  const isAdmin = role === "ADMIN";
  const memberRole = member?.role === "ADMIN"
  const [open, setOpen] = useState(false);

  console.log({memberRole})

  const initials =
    member.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "NA";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <a href="/members" className="btn btn-ghost btn-sm mb-6">
        ← Back to Members
      </a>

      <div className="card w-full bg-white shadow-xl border border-gray-100">
        <div className="card-body p-8 lg:p-12 space-y-8">
          {/* Header: BIG avatar + name + edit (no role/ID line) */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-64 h-64 rounded-full ring ring-indigo-500/30 ring-offset-2 shadow-lg object-cover"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-indigo-100 text-indigo-800 ring ring-indigo-500/30 ring-offset-2 shadow-lg grid place-items-center">
                <span className="text-4xl font-semibold select-none">
                  {initials}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-4 md:pt-4 text-center md:text-left">
              <h1 className="text-4xl font-extrabold text-gray-800">
                {member.name}
              </h1>

            <div className="relative inline-block">
            <div className="peer">
              {isAdmin && <button
                type="button"
                className="btn px-6 py-2 rounded-lg font-semibold tracking-wide 
                          bg-indigo-600 hover:bg-indigo-700 text-white transition-all
                          cursor-pointer disabled:cursor-not-allowed disabled:opacity-100"
                disabled={!isAdmin}
                onClick={() => isAdmin && setOpen(true)}
                title={isAdmin ? "Edit profile" : "Only admins can edit"}
              >
                Edit Profile
              </button>}
            </div>

            {!isAdmin && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                          hidden peer-hover:flex items-center gap-2
                          bg-base-100 text-base-content text-sm font-medium
                          border border-base-300 rounded-lg shadow-lg
                          px-3 py-2 z-10 whitespace-nowrap"
                role="tooltip"
              >
                🚫 Only admins can edit
              </div>
            )}

            {isAdmin && (
              <div><PromoteToAdmin memberId={member.id} memberRole={memberRole}/></div>
            )}
          </div>
            </div>
          </div>

          {/* Description box */}
          <div className="divider text-gray-400">Profile Details</div>
          <div className="border border-gray-200 bg-gray-50 p-6 rounded-xl shadow-inner space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {member.description ? (
                member.description
              ) : (
                <span className="italic opacity-60">
                  No description provided for this member yet.
                </span>
              )}
            </p>
          </div>

          {/* Editor placeholder */}
          {open && (
            <div className="mt-8 p-6 border-2 border-dashed border-indigo-300 bg-indigo-50 rounded-xl text-center">
              <p className="text-lg font-semibold">AvatarEditor Placeholder</p>
              <div className="text-sm opacity-80">
                <AvatarEditor 
                  memberId={member.id} 
                  initialName={member.name} 
                  initialDescription={member.description ?? ""} 
                  onClose={() => setOpen(false)} 
                  onDone={() => {
                    setOpen(false);
                    router.refresh();
                  }}
                />             
                 </div>
          
            </div>
          )}
        </div>
      </div>
    </div>
  );
}