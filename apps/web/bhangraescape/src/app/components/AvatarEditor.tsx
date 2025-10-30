// app/members/[id]/components/AvatarEditorUrl.tsx (CLIENT)
"use client";

import { useState } from "react";

export default function AvatarEditorUrl({
  memberId,
  initialUrl,
  onClose,
  onDone,
}: {
  memberId: string;
  initialUrl: string;
  onClose: () => void; // called when user cancels
  onDone: () => void;  // called after successful save
}) {
  const [url, setUrl] = useState(initialUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tiny client guard: very light URL check
  function looksLikeUrl(str: string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSave() {
    setError(null);

    // 1) basic client checks
    if (!url.trim()) {
      setError("Please enter an image URL.");
      return;
    }
    if (!looksLikeUrl(url.trim())) {
      setError("That doesn't look like a valid URL.");
      return;
    }

    setSaving(true);
    try {
      // 2) call our PATCH proxy
      const res = await fetch(`/api/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url.trim() }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Save failed: ${res.status} ${t}`);
      }

      // 3) success → tell parent to close + refresh
      onDone();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save avatar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div>
        <label htmlFor="avatar-url" className="block text-sm font-medium">
          Avatar URL
        </label>
        <input
          id="avatar-url"
          type="url"
          placeholder="https://example.com/photo.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered w-full"
          disabled={saving}
        />
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          title="Save avatar URL"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          disabled={saving}
          title="Cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}