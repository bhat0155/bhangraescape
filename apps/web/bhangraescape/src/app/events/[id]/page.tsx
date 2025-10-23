import { EventDetail } from "@/app/types/events";
import { formatDate } from "@/app/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import AvailabilityPicker from "@/app/components/AvailabilityPicker";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import InterestedToggle from "@/app/components/InterestedToggle";


export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: eventId } = await params;  
  console.log({eventId})
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!

  // user info
  const session = await auth();
  const role = (session?.user as any)?.role ?? "GUEST";
  // read jwt from cookies and then pass it to express
  const token =
    cookies().get("__Secure-authjs.session-token")?.value ??
    cookies().get("authjs.session-token")?.value ??
    null;

    const res = await fetch(`${base}/events/${eventId}`,{
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,

    })
  
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
      {/* Toggle */}
      <section className="space-y-3">


  {role === "GUEST" ? (
    <div className="alert alert-info">
      <span>Sign in to mark interest.</span>
    </div>
  ) : (
    <InterestedToggle
      eventId={data.event.id}
      role={role}
      canSet={data.capabilities?.canSetInterest ?? false}
      initialInterested={!!data.interested}
    />
  )}
</section>

      {/* availbility */}
     <section className="space-y-3">
        <h2 className="text-xl font-semibold">Practice Availability</h2>
        <AvailabilityPicker
          eventId={data.event.id}
          role={role}
          canSet={data.capabilities.canSetAvailability}
          initialMyDays={data.myDays}
          initialTallies={data.tallies}
          initialTopDays={data.topDays}
        />
      </section>
    </div>
  );
}