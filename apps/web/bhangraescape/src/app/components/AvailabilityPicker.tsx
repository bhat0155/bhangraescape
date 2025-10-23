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

  // Memoized string for Top Days display
  const topDaysInfo = useMemo(() => {
    if (topDays.length === 0) return "No availability set by members yet.";
    if (topDays.length === 1) return `Top day: ${topDays[0].weekday} (${topDays[0].count} votes)`;
    
    // Display the top two days
    const [a, b] = topDays;
    return `${a.weekday} (${a.count}), ${b.weekday} (${b.count})`;
  }, [topDays]);

  // Custom styles for smaller, less jarring chips
  const chipBaseClasses = "transition-all duration-200 rounded-md text-xs font-semibold shadow-sm";
  
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
    // Reduced outer spacing and removed outer padding
    <div className="space-y-3 relative group">
      
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
      {/* Reduced bottom padding */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
        
        {/* Chips */}
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
                  // Reduced padding and font size for chips
                  "px-3 py-1.5 border", 
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

        {/* Save Button (Smaller and pushed to the right) */}
        <button
          type="button"
          disabled={disabled}
          className={[
            // Reduced padding and font size for button
            "ml-auto px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
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
      {/* Reduced top padding and opacity */}
      <div className="pt-2 border-t border-gray-100 opacity-70">
        {/* Smaller heading */}
        <h3 className="text-xs font-semibold mb-1 text-gray-600">Availability Tally</h3>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((d) => (
            <div 
              key={d} 
              className="rounded-md py-1 transition-colors duration-200"
              style={{ backgroundColor: tallies[d] > 0 ? '#e0f2f1' : '#f7f7f7' }} // Lighter green/gray
            >
              <div className="font-medium text-gray-600 text-[10px]">{d}</div>
              {/* Reduced count size */}
              <div className="text-sm font-bold" style={{ color: tallies[d] > 0 ? '#00838f' : '#888' }}>
                {tallies[d] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Highlighted Top Days Readout (Subtler Emphasis, Placed last) --- */}
      {/* Reduced top padding */}
      <div className="pt-2">
          {/* Smaller heading */}
          <h3 className="text-sm font-semibold mb-1 text-gray-700">Recommended Days</h3>
          {/* Reduced padding, border, and font size */}
          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200 shadow-sm">
              <span className="text-sm text-gray-900 font-semibold">
                  ⭐ {topDaysInfo}
              </span>
          </div>
      </div>
      
    </div>
  );
}
