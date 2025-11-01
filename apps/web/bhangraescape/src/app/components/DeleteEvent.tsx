"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react"; // nice delete icon

type Role = "GUEST" | "ADMIN" | "MEMBER";

export default function DeleteEvent({
  role,
  eventId,
}: {
  role: Role;
  eventId: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setError(null);

    try {
      setDeleting(true);
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Error deleting the event");

      router.push("/events");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-center mt-10 space-y-3">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`btn px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 shadow-md
          ${deleting
            ? "bg-red-400 cursor-not-allowed"
            : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          }`}
      >
        <Trash2 className="w-4 h-4 mr-2 inline-block" />
        {deleting ? "Deleting…" : "Delete Event"}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg shadow-sm">
          {error}
        </div>
      )}
    </div>
  );
}