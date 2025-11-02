// PromoteToAdmin.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PromoteToAdmin({
  memberId,
  memberRole,            // boolean: true if already ADMIN
}: {
  memberId: string;
  memberRole: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${memberId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "ADMIN" }),
      });
      if (!res.ok) throw new Error("Issues promoting to admin on API side");
      router.refresh();
    } catch (err: any) {
      setError(`Cannot promote member to admin: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (memberRole) return null; // already admin → hide button

  // Just the button (no centering wrapper)
  return (
    <>
      <button
        onClick={handleClick}
        disabled={saving}
        className={`btn btn-sm px-6 py-2 rounded-lg font-semibold text-white transition
        ${saving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
      >
        {saving ? "Saving..." : "Promote to Admin"}
      </button>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </>
  );
}