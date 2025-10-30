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
    <div className="mt-4">
      <button
        type="button"
        className="btn btn-error btn-sm inline-flex items-center gap-2"
        onClick={handleDelete}
        disabled={deleting}
        title="Delete this member"
      >
        <Trash2 size={16} />
        {deleting ? "Deleting…" : "Delete"}
      </button>
      {err && <div className="text-sm text-red-600 mt-2">{err}</div>}
    </div>
  );
}