"use client"
import Image from "next/image";
import PerformersEditor from "./PerformersEditor";
import { useState } from "react";

export type Performer = {
  id: string;
  name: string;
  avatarUrl?: string | null;
  description?: string | null;
};

export default function Performers({
  performers,
  eventId,
  role
}: {
  performers: Performer[];
  eventId: string
  role: "GUEST" | "MEMBER" | "ADMIN";
}) {
  const hasPerformers = performers && performers.length > 0;
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Performers</h2>

        {/* Edit button with hover tooltip for non-admins */}
        <div className="relative group">
          <button
            type="button"
            disabled={!isAdmin}
            onClick={() => isAdmin && setOpen(true)}
            className={`btn btn-sm btn-outline ${
              !isAdmin ? "opacity-70 cursor-not-allowed" : "hover:bg-primary hover:text-white"
            }`}
            title={isAdmin ? "Edit performers" : "Only admins can edit performers"}
            aria-disabled={!isAdmin}
          >
            🖋️
          </button>

          {!isAdmin && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2 
                         hidden group-hover:flex items-center gap-2
                         bg-white text-gray-700 text-sm font-medium 
                         border border-gray-200 rounded-lg shadow-lg
                         px-3 py-2 z-10 whitespace-nowrap"
            >
              <span role="img" aria-label="forbidden" className="text-red-500">🚫</span>
              Only admins can edit performers
            </div>
          )}
        </div>
      </header>

      {/* panel always renders */}
      <div className="rounded-xl bg-base-100 shadow p-4">
        {hasPerformers ? (
          <ul className="flex gap-6 overflow-x-auto sm:flex-wrap">
            {performers.map((p) => (
              <li key={p.id} className="shrink-0 text-center">
                <figure className="avatar mx-auto">
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl}
                      alt={p.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-base-300 grid place-items-center">
                      <span className="text-sm font-semibold">
                        {initials(p.name)}
                      </span>
                    </div>
                  )}
                </figure>
                <div className="mt-2 text-sm">{p.name}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm opacity-70 text-center py-6">
            Such Empty, Much Wow.
          </div>
        )}
      </div>

      {open && (
        <div className="mt-3">
          <PerformersEditor
            initialIds={performers.map((item) => item.id)}
            eventId={eventId}
            role={role}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </section>
  );
}

// Helper for initials fallback
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}