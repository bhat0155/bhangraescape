"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";  

type Props = {
  eventId: string;
  role: "GUEST" | "MEMBER" | "ADMIN";
  canSet: boolean;           
  initialInterested: boolean; 
};

export default function InterestedToggle({
  eventId,
  role,
  canSet,
  initialInterested,
}: Props) {
  const router = useRouter();
  const [interested, setInterested] = useState<boolean>(initialInterested);
  const [saving, setSaving] = useState(false);

  const disabled = role === "GUEST" || !canSet || saving;

  async function onToggle() {
    if (disabled) return;
    setSaving(true);

    const prev = interested;
    setInterested(!prev);

    try {
      const resp = await fetch(`/api/events/${eventId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ interested: !prev }),
      });

      if (!resp.ok) {
        setInterested(prev);
        if (resp.status === 401) throw new Error("Please sign in.");
        if (resp.status === 403) throw new Error("Not allowed.");
        throw new Error(`${resp.status} ${resp.statusText}`);
      }

      const ct = resp.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = (await resp.json()) as { interested?: boolean };
        if (typeof json.interested === "boolean") {
          setInterested(json.interested);
        }
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      console.error("Failed to update interest.");
    } finally {
      setSaving(false);
    }
  }

  const toggleTitle =
    role === "GUEST"
      ? "Sign in to set interest."
      : !canSet
      ? "You can’t set interest for this event."
      : "";

  return (
    <div className="flex items-center justify-between gap-4 flex-nowrap w-full p-2 border-b border-gray-200">
      <h2 className="text-xl font-semibold">Performing Interest</h2>

      <label
        className={`relative inline-flex items-center cursor-pointer transition-opacity duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title={toggleTitle}
      >
        <input
          type="checkbox"
          checked={interested}
          onChange={onToggle}
          className="sr-only peer"
          disabled={disabled}
        />

        {/* Track */}
        <div
          className="w-11 h-6 bg-gray-300 rounded-full peer
                     peer-focus:ring-2 peer-focus:ring-indigo-400
                     peer-checked:bg-indigo-700 transition duration-300 ease-in-out shadow-inner"
        ></div>

        {/* Knob */}
        <div
          className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-md
                     peer-checked:translate-x-5"
        ></div>

        {/* Spinner overlay while saving */}
        {saving && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </label>
    </div>
  );
}