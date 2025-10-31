
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react"; 

type Role = "GUEST" | "MEMBER" | "ADMIN";

export default function FinalMixEditor({
  eventId,
  initialTitle,
  initialUrl,
  role, 
}: {
  eventId: string;
  initialTitle: string;
  initialUrl: string;
  role: Role;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isAdmin = role === "ADMIN";

  function looksLikeUrl(v: string) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setErr(null);
    const t = title.trim();
    const u = url.trim();

    if (!u) {
      setErr("Please enter a URL.");
      return;
    }
    if (!looksLikeUrl(u)) {
      setErr("That doesn't look like a valid URL.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalPlaylistTitle: t || null,
          finalPlaylistUrl: u,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Update failed (${res.status})`);
      }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save final mix.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {/* ③ Always visible icon button. Same color for everyone. 
            Hover effect only for admins (non-admins don't get hover state). */}
      <div className="relative inline-flex group">
        <button
          type="button"
className={`btn btn-primary btn-sm px-4 py-2 ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}          aria-disabled={!isAdmin}
          // Only admins can toggle the editor
          onClick={() => {
            if (!isAdmin) return;
            setOpen((v) => !v);
          }}
          title={isAdmin ? (open ? "Close editor" : "Edit final mix") : "Only admins can add media"}
        >
          Edit
          <span className="sr-only">{open ? "Close editor" : "Edit final mix"}</span>
        </button>

        {/* ④ Tooltip for non-admins, on hover over the button only */}
        {!isAdmin && (
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:flex items-center gap-2
                       bg-base-100 text-base-content text-sm font-medium
                       border border-base-300 rounded-lg shadow-lg px-3 py-2 z-10 whitespace-nowrap"
          >
            <span role="img" aria-label="forbidden" className="text-error">🚫</span>
            Only admins can add media
          </div>
        )}
      </div>

      {/* Editor panel */}
      {open && (
        <div className="mt-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm w-[min(36rem,90vw)]">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Title (optional)</label>
              <input
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Final Mix — October Show"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">SoundCloud/YouTube/Spotify URL</label>
              <input
                className="input input-bordered w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://soundcloud.com/your-mix"
                disabled={saving}
              />
            </div>

            {err && <div className="text-sm text-error">{err}</div>}

            <div className="flex gap-2 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm px-4 py-2"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}