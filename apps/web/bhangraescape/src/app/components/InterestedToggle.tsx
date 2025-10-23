"use client";

import { useState } from "react";

type Props = {
  eventId: string;
  role: "GUEST" | "MEMBER" | "ADMIN";
  canSet: boolean;           // from capabilities.canSetInterest
  initialInterested: boolean; // from event detail
};

export default function InterestedToggle({
  eventId,
  role,
  canSet,
  initialInterested,
}: Props) {
  const [interested, setInterested] = useState<boolean>(initialInterested);
  const [saving, setSaving] = useState(false);

  // Disable for guests, when backend disallows, or while saving
  const disabled = role === "GUEST" || !canSet || saving;

  // The main handler logic remains the same
  async function onToggle() {
    if (disabled) return;
    setSaving(true);

    // Optimistic UI: flip locally first
    const prev = interested;
    setInterested(!prev);

    try {
      // NOTE: Added credentials: "include" to ensure auth cookies are sent
      const resp = await fetch(`/api/events/${eventId}/interest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({interested: !prev})
      });

      if (!resp.ok) {
        // revert on error
        setInterested(prev);
        if (resp.status === 401) throw new Error("Please sign in.");
        if (resp.status === 403) throw new Error("Not allowed.");
        throw new Error(`${resp.status} ${resp.statusText}`);
      }

      // Sync state with server response if JSON is provided
      const ct = resp.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = await resp.json() as { interested?: boolean };
        if (typeof json.interested === "boolean") {
          setInterested(json.interested);
        }
      }
    } catch (err) {
      console.error(err);
      // Replaced alert() with console error as per instructions
      console.error("❌ Failed to update interest.");
    } finally {
      setSaving(false);
    }
  }

  // Determine the helper text for the label
  const toggleTitle = role === "GUEST"
    ? "Sign in to set interest."
    : !canSet
    ? "You can’t set interest for this event."
    : "";


  return (
    // We use justify-between and items-center to put the label on the left 
    // and push the toggle to the far right.
    <div className="flex items-center justify-between gap-4 flex-nowrap w-full p-2 border-b border-gray-200">
      
      {/* Label Text (Left side) - Updated to "Performing Interest" */}
      <h2 className="text-xl font-semibold">Performing Interest</h2>

      {/* --- iOS Style Toggle Switch Implementation (Right side) --- */}
      <label 
        className={`relative inline-flex items-center cursor-pointer transition-opacity duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={toggleTitle}
      >
        
        {/* Hidden Checkbox Input (The functional core) */}
        <input 
          type="checkbox" 
          checked={interested} 
          onChange={onToggle} // Triggers the save/API call
          className="sr-only peer" // Hidden, but used for CSS targeting
          disabled={disabled}
        />

        {/* The Track (The rounded background bar) */}
        <div 
          className="w-11 h-6 bg-gray-300 rounded-full peer 
                     peer-focus:ring-2 peer-focus:ring-indigo-400 
                     peer-checked:bg-green-500 transition duration-300 ease-in-out shadow-inner"
        ></div>

        {/* The Thumb/Slider (The circular element) */}
        <div 
          className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-md
                     peer-checked:translate-x-5"
        ></div>
        
        {/* Loading Indicator overlay (Appears when saving) */}
        {saving && (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}

      </label>
      {/* --- END Toggle Switch Implementation --- */}
      
    </div>
  );
}
