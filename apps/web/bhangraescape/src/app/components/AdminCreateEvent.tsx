"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  role: "GUEST" | "MEMBER" | "ADMIN";
};

export default function AdminCreateEvent({ role }: Props) {
  const router = useRouter();

  // local form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const isAdmin = role === "ADMIN";
  const readOnly = !isAdmin;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);
    if (!isAdmin) return;
    if (!title.trim() || !location.trim() || !dateStr) {
      setErrMsg("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Use the provided date string to create an ISO string for the API
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          location: location.trim(),
          date: new Date(dateStr).toISOString(),
        }),
        credentials: "include", // Ensure credentials are included for auth
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Create failed: ${res.status} ${res.statusText} — ${t}`);
      }

      const json = (await res.json()) as { id: string };
      router.push(`/events/${json.id}`);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to create event.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      // Added max-w-lg for better centering/focus on medium screens
      className="card bg-white border border-gray-200 shadow-lg max-w-lg mx-auto"
      title={readOnly ? "Only admins can create events." : ""}
      aria-disabled={readOnly}
    >
      <div className="card-body p-6 sm:p-8">
        <h2 className="card-title text-2xl font-bold mb-1 text-gray-800">
          Create New Event
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Provide the core details. Performers, media, and final mix can be added later.
        </p>

        {errMsg && (
          <div role="alert" className="alert alert-error bg-red-100 text-red-700 border-red-400 border p-3 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errMsg}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-control">
            <label htmlFor="title" className="label py-1">
              <span className="label-text font-semibold text-gray-700">Title</span>
            </label>
            <input
              id="title"
              className="input input-bordered w-full border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
              placeholder="e.g., Diwali 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readOnly || submitting}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="location" className="label py-1">
              <span className="label-text font-semibold text-gray-700">Location</span>
            </label>
            <input
              id="location"
              className="input input-bordered w-full border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
              placeholder="e.g., Aroha"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={readOnly || submitting}
              required
            />
          </div>

          <div className="form-control">
            <label htmlFor="date" className="label py-1">
              <span className="label-text font-semibold text-gray-700">Date &amp; Time</span>
            </label>
            <input
              id="date"
              type="datetime-local"
              className="input input-bordered w-full border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-150"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              disabled={readOnly || submitting}
              required
            />
            <label className="label">
              <span className="label-text-alt text-xs text-gray-500">
                Stored in UTC (converted from your local selection).
              </span>
            </label>
          </div>

          <div className="card-actions justify-end pt-4">
            <button
              type="submit"
              className={`btn btn-primary bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md border-b-4 border-indigo-800 hover:border-indigo-700 transition duration-300 
                ${readOnly ? "opacity-50 cursor-not-allowed" : ""}
                ${submitting ? "opacity-70" : ""}`
              }
              disabled={
                readOnly ||
                submitting ||
                !title.trim() ||
                !location.trim() ||
                !dateStr
              }
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner w-4 h-4 mr-2" />
                  Creating…
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </div>

          {!isAdmin && (
            <p className="text-sm text-center text-red-500 mt-4">
              🚫 Only admins can create events.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
