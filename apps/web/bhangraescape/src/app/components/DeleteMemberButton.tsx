"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteMemberButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    setErr(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Delete failed (${res.status})`);
      }
      // ✅ On success, navigate back to the listing
      router.push("/members");
      // Optional: ensure fresh list if the page keeps cache
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to delete member.");
    } finally {
      setDeleting(false);
    }
  }

return (
  <div className="mt-6 text-center">
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title="Delete this member"
      className={`inline-flex items-center justify-center gap-2
                  px-6 py-2.5 rounded-lg font-semibold text-white
                  transition-all duration-200
                  ${deleting
                    ? "bg-rose-300 cursor-not-allowed"
                    : "bg-rose-500 hover:bg-rose-600 active:bg-rose-700 shadow-sm"
                  }`}
    >
      <Trash2 size={18} />
      {deleting ? "Deleting…" : "Delete Member"}
    </button>

    {err && (
      <div className="text-sm text-rose-600 mt-3 font-medium">
        {err}
      </div>
    )}
  </div>
);
}