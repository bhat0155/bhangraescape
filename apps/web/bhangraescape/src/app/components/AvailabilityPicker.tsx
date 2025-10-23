"use client";

import { useMemo, useState } from "react";
import type { Weekday } from "@/app/types/events";

// FIX: Corrected array literal syntax which had a typo in the previous file
const WEEKDAYS: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

type Props = {
  eventId: string;
  role: "GUEST" | "MEMBER" | "ADMIN";
  canSet: boolean; // pass capabilities.canSetAvailability here
  initialMyDays: Weekday[];
  initialTallies: Record<Weekday, number>;
  initialTopDays: Array<{ weekday: Weekday; count: number }>;
};

// Destructure all initial data and allow saving state
export default function AvailabilityPicker({
  eventId,
  role,
  canSet,
  initialMyDays,
  initialTallies,
  initialTopDays,
}: Props) {
  // --- Local State ---
  const [selected, setSelected] = useState<Set<Weekday>>(
    () => new Set(initialMyDays)
  );
  // State for tallies and top days, initialized from props
  const [tallies, setTallies] = useState(initialTallies);
  const [topDays, setTopDays] = useState(initialTopDays);
  const [saving, setSaving] = useState(false); // Reintroduced for UX

  // --- Permissions ---
  const disabled = role === "GUEST" || !canSet || saving;
  const isGuest = role === "GUEST"; // Flag for specific guest UI

  function toggle(day: Weekday) {
    if (disabled) return; // respect disabled
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  // Memoized string for selected days display
  const selectedList = useMemo(
    () => Array.from(selected).join(", ") || "—",
    [selected]
  );

  // Memoized string for Top Days display (NEW)
  const topDaysInfo = useMemo(() => {
    if (topDays.length === 0) return "No availability set by members yet.";
    if (topDays.length === 1) return `Top day: ${topDays[0].weekday} (${topDays[0].count} votes)`;
    
    // Display the top two days
    const [a, b] = topDays;
    return `Top days: ${a.weekday} (${a.count}), ${b.weekday} (${b.count})`;
  }, [topDays]);

  // Custom styles for larger, better-padded chips
  const chipBaseClasses = "transition-all duration-200 rounded-lg text-sm font-semibold shadow-sm";
  
  async function saveAvailability(){
    setSaving(true); // Start loading state
    
    // Convert the Set to an Array right before the fetch
    const daysArray = Array.from(selected);

    try {
        const res = await fetch(`/api/events/${eventId}/availability`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({"days": daysArray})
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`API Error: ${res.status} ${res.statusText}`, errorText);
            throw new Error(`Failed to save availability: ${res.status} ${res.statusText}`);
        }
        
        // Parse and use the updated data
        const data = await res.json() as {
            myDays: Weekday[];
            tallies: Record<Weekday, number>;
            topDays: Array<{ weekday: Weekday; count: number }>;
        };
        
        // Update state with the server's truth
        setSelected(new Set(data.myDays));
        setTallies(data.tallies);
        setTopDays(data.topDays);
        console.log("SAVE successful, received data:", data);

    } catch (err) {
        console.error("Error during save operation:", err);
    } finally {
        setSaving(false); // End loading state
    }
  }

  return (
    <div className="space-y-6 relative group p-1">
      
      {/* 🚫 Guest Overlay: Appears only on hover for guests to show message */}
      {isGuest && (
        <div 
          className="absolute inset-0 z-10 
                     flex items-center justify-center 
                     cursor-not-allowed transition-opacity duration-300 pointer-events-none"
        >
          {/* Message bubble: hidden by default, visible on group-hover */}
          <div className="flex items-center text-base font-bold text-gray-800 p-4 bg-white/95 rounded-xl shadow-2xl border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
             <span className="mr-3 text-xl" role="img" aria-label="No entry">🚫</span>
             <span>Only members can choose availability.</span>
          </div>
        </div>
      )}

      {/* --- Chips Container & Save Button (Combined and Aligned) --- */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
        
        {/* Chips */}
        <div className="flex flex-wrap gap-2"> 
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
                  "px-4 py-2 border", // Custom increased padding
                  chipBaseClasses,
                  isGuest ? "opacity-60" : "", 
                  isOn
                    ? "bg-green-500 border-green-600 text-white hover:bg-green-600 shadow-green-500/30"
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

        {/* Save Button (Now next to chips, pushed to the right with ml-auto) */}
        <button
          type="button"
          disabled={disabled}
          className={[
            "ml-auto px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
            "shadow-md",
            disabled ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-70" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/50",
          ].join(" ")}
          onClick={() => {
            if (disabled) return;
            saveAvailability()
          }}
        >
          {saving ? "Saving..." : "Save Availability"}
        </button>
      </div>

      {/* --- Weekly Tallies Grid (Smaller/Less Significant) --- */}
      <div className="pt-4 border-t border-gray-200 opacity-80">
        <h3 className="text-sm font-semibold mb-2 text-gray-600">Availability Tally (All Members)</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((d) => (
            <div 
              key={d} 
              className="rounded-md py-1.5 transition-colors duration-200"
              style={{ backgroundColor: tallies[d] > 0 ? '#e0f2f1' : '#f7f7f7' }} // Lighter green/gray
            >
              <div className="font-medium text-gray-600 text-[10px]">{d}</div>
              <div className="text-base font-extrabold" style={{ color: tallies[d] > 0 ? '#00838f' : '#888' }}>
                {tallies[d] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Highlighted Top Days Readout (Primary Insight, Placed last) --- */}
      <div className="pt-4">
          <h3 className="text-base font-semibold mb-2 text-gray-700">Recommended Days</h3>
          <div className="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-300 shadow-lg">
              <span className="text-lg text-gray-900 font-extrabold">
                  ⭐ {topDaysInfo}
              </span>
          </div>
      </div>
      
    </div>
  );
}
