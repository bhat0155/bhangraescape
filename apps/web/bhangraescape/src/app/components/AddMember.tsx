"use client";
import { useState } from "react";
import AddMemberModal from "./AddMemberModal";

export default function AddMember({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  function onClose() {
    setOpen(false);
  }

  return (
    <div className="relative inline-block">
      {/* Button */}
      <div className="peer">
        <button
          type="button"
          disabled={!isAdmin}
          onClick={() => isAdmin && setOpen((prev) => !prev)}
          title={isAdmin ? "Add a new member" : "Only admins can add members"}
          className={`px-6 py-2 rounded-lg  transition-all duration-200
                      ${isAdmin
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        : "bg-indigo-300 text-white opacity-70 cursor-not-allowed"
                      }`}
        >
          Add Member
        </button>
      </div>

      {/* Tooltip for non-admins */}
      {!isAdmin && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden peer-hover:flex items-center gap-2
                     bg-white text-gray-700 text-sm font-medium
                     border border-gray-200 rounded-lg shadow-lg px-3 py-2 z-10 whitespace-nowrap"
        >
          🚫 Only admins can add members
        </div>
      )}

      {/* Modal */}
      {open && <AddMemberModal onClose={onClose} />}
    </div>
  );
}