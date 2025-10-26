"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Role = "GUEST" | "MEMBER" | "ADMIN";

type EligiblePerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "MEMBER" | "ADMIN";
};

export default function PerformersEditor({
  initialIds,
  eventId,
  role,
  onClose,
}: {
  initialIds: string[];
  eventId: string;
  role: Role;
  onClose: () => void;
}) {
  const router = useRouter();
  const isAdmin = role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eligible, setEligible] = useState<EligiblePerson[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialIds)
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/eligible-performers`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch eligible performers");
        const json = (await res.json()) as { items: EligiblePerson[] };
        if (!cancelled) setEligible(json.items ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function onSave() {
    if (saving) return;
    setSaving(true);
    try {
      const userIds = Array.from(selected);
      const res = await fetch(`/api/events/${eventId}/performers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Save failed ${res.status} ${t}`);
      }
      router.refresh();
      onClose?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function onClearAll() {
    if (!isAdmin || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/performers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [] }),
      });
      if (!res.ok) throw new Error("Clear failed");
      setSelected(new Set());
      router.refresh();
      onClose?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const disabled = !isAdmin || loading || saving;

  // 🌸 --- UI ---
  return (
    <div className="rounded-xl bg-base-100 p-6 shadow-md border border-base-300 space-y-5">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          Select Performers
        </h3>
        {loading && (
          <span className="loading loading-spinner loading-sm text-primary"></span>
        )}
      </header>

      <ul className="divide-y divide-base-200">
        {eligible.map((item) => {
          const isChecked = selected.has(item.id);
          return (
            <li
              key={item.id}
              className="flex items-center justify-between py-2 hover:bg-base-200 rounded-lg px-2 transition"
            >
              <div className="flex items-center gap-3">
                {item.avatarUrl ? (
                  <Image
                    src={item.avatarUrl}
                    alt={item.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-base-300 grid place-items-center text-xs font-bold">
                    {item.name[0]?.toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.role === "ADMIN" && (
                    <p className="text-xs text-indigo-500 font-semibold">
                      Admin
                    </p>
                  )}
                </div>
              </div>

              <input
                type="checkbox"
                checked={isChecked}
                disabled={!isAdmin}
                onChange={() => toggle(item.id)}
                className="checkbox checkbox-primary"
              />
            </li>
          );
        })}
      </ul>

      <footer className="flex justify-end gap-3 pt-3 border-t border-base-200">
        <button
          onClick={onSave}
          disabled={disabled}
          className="btn btn-primary"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          onClick={onClearAll}
          disabled={disabled}
          className="btn btn-outline btn-primary"
        >
          Clear All
        </button>

        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="btn btn-error btn-outline"
        >
          Cancel
        </button>
      </footer>
    </div>
  );
}