import { EventDetail } from "@/app/types/events";
import { formatDate } from "@/app/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${base}/events/${params.id}`;

  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch event details: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const event = data.event as EventDetail;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <div className="flex items-center gap-2">
        <Link
          href="/events"
          className="btn btn-ghost btn-sm flex items-center gap-1"
        >
          ← Back to Events
        </Link>
      </div>

      {/* Event header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-primary">{event.title}</h1>
        <p className="text-sm opacity-70">
          <span className="font-medium">Date:</span> {formatDate(event.date)}
        </p>
        <p className="text-sm opacity-70">
          <span className="font-medium">Location:</span> {event.location}
        </p>
      </div>

      {/* Event Summary Card */}
      <div className="card bg-base-100 shadow-xl p-6 mt-6">
        <h2 className="text-xl font-semibold mb-2">Event Summary</h2>
        <p className="opacity-80">
          {event.description || "No additional details available for this event yet."}
        </p>
      </div>
    </div>
  );
}