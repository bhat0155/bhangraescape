import { EventDetail } from "@/app/types/events";
import { formatDate } from "@/app/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";
import AvailabilityPicker from "@/app/components/AvailabilityPicker";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import InterestedToggle from "@/app/components/InterestedToggle";
import Performers from "@/app/components/Performers";
import type { MediaItem } from "@/app/types/media";
import MediaGrid from "@/app/components/MediaGrid"; 
import FinalMix from "@/app/components/FinalMix";
import PerformersEditor from "@/app/components/PerformersEditor";
import MediaManager from "@/app/components/MediaManager";

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
  
  // Fetching media for the event
  const mediaRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${eventId}/media`, {cache: "no-store"})
  if(!mediaRes.ok){
    throw new Error(`Failed to fetch media ${mediaRes.status} ${mediaRes.statusText}`)
  }
  const mediaJson = await mediaRes.json();
  const mediaItems = (mediaJson.items || []) as MediaItem[]

  const finalTitle = data.event.finalPlaylistTitle ?? null;
  const finalUrl   = data.event.finalPlaylistUrl ?? null;

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

      {/* Performers */}

      <Performers performers={data.performers} role={role} eventId={event.id}/>

      
      
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
      {/* final Mix */}
      <FinalMix title={finalTitle} url={finalUrl}/>
      {/* <MediaGrid items={mediaItems}></MediaGrid> */}
      <MediaManager eventId={event.id} role={role} initialMedia={mediaItems}/>
    </div>
  );
}