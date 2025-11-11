"use client";

import { useMemo, useState } from "react";
import type { Weekday } from "@/app/types/events";

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
  const [selected, setSelected] = useState<Set<Weekday>>(
    () => new Set(initialMyDays)
  );
  const [tallies, setTallies] = useState(initialTallies);
  const [topDays, setTopDays] = useState(initialTopDays);
  const [saving, setSaving] = useState(false);

  const isGuest = role === "GUEST";
  const disabled = isGuest || !canSet || saving;
  const lockReason = isGuest
    ? "Only members can choose availability."
    : !canSet
      ? "Can't modify past dated events."
      : null;

  function toggle(day: Weekday) {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
            next.delete(day);
          } else {
            next.add(day);
          }
      return next;
    });
  }

  const topDaysInfo = useMemo(() => {
    if (topDays.length === 0) return "No availability set by members yet.";
    if (topDays.length === 1)
      return `Top day: ${topDays[0].weekday} (${topDays[0].count} votes)`;
    const [a, b] = topDays;
    return `${a.weekday} (${a.count}), ${b.weekday} (${b.count})`;
  }, [topDays]);

  const chipBaseClasses =
    "transition-all duration-200 rounded-md text-xs font-semibold shadow-sm";

  async function saveAvailability() {
    setSaving(true);
    const daysArray = Array.from(selected);

    try {
      const res = await fetch(`/api/events/${eventId}/availability`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: daysArray }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`API Error: ${res.status} ${res.statusText}`, errorText);
        throw new Error(
          `Failed to save availability: ${res.status} ${res.statusText}`
        );
      }

      const data = (await res.json()) as {
        myDays: Weekday[];
        tallies: Record<Weekday, number>;
        topDays: Array<{ weekday: Weekday; count: number }>;
      };

      setSelected(new Set(data.myDays));
      setTallies(data.tallies);
      setTopDays(data.topDays);
      console.log("SAVE successful, received data:", data);
    } catch (err) {
      console.error("Error during save operation:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 relative group">
      {lockReason && (
        <div className="absolute inset-0 z-10 flex items-center justify-center cursor-not-allowed transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center text-base font-bold text-gray-800 p-4 bg-white/95 rounded-xl shadow-2xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <span className="mr-3 text-xl" role="img" aria-label="No entry">
              🚫
            </span>
            <span>{lockReason}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d) => {
            const isOn = selected.has(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggle(d)}
                disabled={disabled}
                title={disabled ? "You can’t change availability right now." : ""}
                className={[
                  "px-3 py-1.5 border",
                  chipBaseClasses,
                  isGuest ? "opacity-60" : "",
                  isOn
                    ? "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700 shadow-indigo-500/30"
                    : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200",
                  disabled && !isGuest ? "cursor-not-allowed opacity-70" : "",
                ].join(" ")}
                aria-pressed={isOn}
                aria-disabled={disabled}
              >
                {d}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={disabled}
          className={[
            "ml-auto px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
            "shadow-md",
            disabled
              ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70"
              : "bg-indigo-700 text-white hover:bg-indigo-800 shadow-indigo-500/50",
          ].join(" ")}
          onClick={() => {
            if (disabled) return;
            saveAvailability();
          }}
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>

      <div className="pt-2 border-t border-gray-100 opacity-70">
        <h3 className="text-xs font-semibold mb-1 text-gray-600">
          Availability Tally
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="rounded-md py-1 transition-colors duration-200"
              style={{
                backgroundColor: tallies[d] > 0 ? "#e0e7ff" : "#f7f7f7", // indigo-100 tint
              }}
            >
              <div className="font-medium text-gray-600 text-[10px]">{d}</div>
              <div
                className="text-sm font-bold"
                style={{ color: tallies[d] > 0 ? "#4338ca" : "#888" }} // indigo-700
              >
                {tallies[d] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-semibold mb-1 text-gray-700">
          Recommended Days
        </h3>
        <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-200 shadow-sm">
          <span className="text-sm text-indigo-900 font-semibold">
            ⭐ {topDaysInfo}
          </span>
        </div>
      </div>
    </div>
  );
}
