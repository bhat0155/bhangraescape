// "use client"

// import { useMemo, useState } from "react"
// import type { Weekday } from "../types/events"

// type Props = {
//     eventId: string,
//     role: "GUEST"|"MEMBER"|"ADMIN",
//     canSet: boolean,
//     initialMyDays: Weekday[],
//     initialTallies: Record<Weekday, number>
//     initialTopDays: Array<{weekday: Weekday, count:number}>
// }

// export default function AvailabilityPicker({
//     eventId,
//     role,
//     canSet,
//     initialMyDays,
//     initialTallies,
//     initialTopDays
// }: Props){

//     // local state
//     const [selected, setSelected] = useState<Set<Weekday>>(new Set(initialMyDays));
//     const [tallies, setTallies] = useState(initialTallies);
//     const [top2, setTop2]=useState(initialTopDays);
//     const [saving, setSaving]=useState(false);

//     // permissions


//     return(
//         <div>
//             I am the AvailabilityPicker
//         </div>
//     )
// }

"use client";

import { useState, useMemo } from "react";
import type { Weekday } from "@/app/types/events";

// Define order for rendering weekday chips
const WEEKDAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type Props = {
  eventId: string;
  role: "GUEST" | "MEMBER" | "ADMIN";
  canSet: boolean;
  initialMyDays: Weekday[];
  initialTallies: Record<Weekday, number>;
  initialTopDays: Array<{ weekday: Weekday; count: number }>;
};

export default function AvailabilityPicker({
  eventId,
  role,
  canSet,
  initialMyDays,
  initialTallies,
  initialTopDays,
}: Props) {
  // --- Local state ---
  const [selected, setSelected] = useState<Set<Weekday>>(new Set(initialMyDays));
  const [tallies, setTallies] = useState(initialTallies);
  const [top2, setTop2] = useState(initialTopDays);
  const [saving, setSaving] = useState(false);

  // --- Permissions ---
  const disabled = role === "GUEST" || !canSet || saving;

  // Toggle a day in the selected set
  function toggle(day: Weekday) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  // --- Save handler ---
  async function onSave() {
    if (disabled) return;
    setSaving(true);

    const days = Array.from(selected); // Convert Set -> Array

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!;
      const resp = await fetch(`$/events/${eventId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies/session to backend
        mode: "cors",
        body: JSON.stringify({ days }),
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to set availability.");
        if (resp.status === 403) throw new Error("You don’t have permission to set availability.");
        throw new Error(`${resp.status} ${resp.statusText}`);
      }

      // ✅ Parse updated response from backend
      const json = await resp.json() as {
        myDays: Weekday[];
        tallies: Record<Weekday, number>;
        topDays: Array<{ weekday: Weekday; count: number }>;
      };

      // ✅ Update local state using backend truth
      setSelected(new Set(json.myDays));
      setTallies(json.tallies);
      setTop2(json.topDays);

      alert("✅ Availability saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save availability. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // --- Readable top days display ---
  const info = useMemo(() => {
    if (top2.length === 0) return "No availability yet.";
    if (top2.length === 1) return `Top day: ${top2[0].weekday} (${top2[0].count})`;
    const [a, b] = top2;
    return `Top days: ${a.weekday} (${a.count}), ${b.weekday} (${b.count})`;
  }, [top2]);

  return (
    <div className="space-y-3">
      {/* 🔹 Day selector chips */}
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((d) => {
          const isOn = selected.has(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => toggle(d)}
              disabled={disabled}
              aria-pressed={isOn}
              className={[
                "btn btn-sm",
                isOn ? "btn-primary" : "btn-outline",
                disabled ? "btn-disabled" : "",
              ].join(" ")}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>

      {/* 🔹 Save button + top day info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onSave}
          disabled={disabled || saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <span className="text-sm opacity-70">{info}</span>
      </div>

      {/* 🔹 Team tallies */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d} className="rounded bg-base-200 py-2">
            <div className="font-medium">{d}</div>
            <div className="opacity-70">{tallies[d] ?? 0}</div>
          </div>
        ))}
      </div>

      {/* 🔹 Guest info */}
      {role === "GUEST" && (
        <div className="alert alert-info mt-2">
          <span>Sign in to set your availability.</span>
        </div>
      )}
    </div>
  );
}