"use client";

import { useState } from "react";
import AdminCreateEvent from "./AdminCreateEvent";

type Role = "GUEST" | "MEMBER" | "ADMIN";

export default function CreateButtonInline({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  function handleClick() {
    if (!isAdmin) return;
    setOpen(true);
  }

  return (
    <div className="relative inline-block group">
      {/* Main button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!isAdmin}
        className={`btn btn-primary py-4 px-2 bg-indigo-600 hover:bg-indigo-700 text-white ${!isAdmin ? "btn-disabled cursor-not-allowed" : ""}`}
      >
        Add an Event
      </button>

      {/* Tooltip for non-admins */}
      {!isAdmin && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 
                     hidden group-hover:flex items-center gap-2
                     bg-white text-gray-700 text-sm font-medium 
                     border border-gray-200 rounded-lg shadow-lg
                     px-3 py-2 z-10 whitespace-nowrap"
        >
          <span role="img" aria-label="forbidden" className="text-red-500">
            🚫
          </span>
          Only admins can add events
        </div>
      )}

      {/* Show form if admin clicked */}
      {open && (
        <div className="mt-4 w-full">
          <AdminCreateEvent role={role} />
        </div>
      )}
    </div>
  );
}