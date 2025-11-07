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

import FinalMix from "@/app/components/FinalMix";

import MediaManager from "@/app/components/MediaManager";

import DeleteEvent from "@/app/components/DeleteEvent";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: eventId } = await params;  
  console.log({eventId})
  const base = process.env.API_INTERNAL_BASE_URL!

  // user info
  const session = await auth();
  const role = (session?.user as any)?.role ?? "GUEST";
  const isAdmin = role === "ADMIN"
  // read jwt from cookies and then pass it to express
  const token =
    cookies().get("__Secure-authjs.session-token")?.value ??
    cookies().get("authjs.session-token")?.value ??
    null;

    // 🛑 START OF MODIFIED BLOCK 🛑
    let data: any = null;

    try {
        const res = await fetch(`${base}/events/${eventId}`,{
            cache: "no-store",
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const text = await res.text(); // Read as text first for inspection

        if (res.status === 404) {
            notFound();
        }
        
        if (!res.ok) {
            // Log the raw response body on failure
            console.error(`[CRITICAL FETCH ERROR] Status: ${res.status}. Body: ${text}`);
            throw new Error(`Failed to fetch event details: ${res.status} ${res.statusText}`);
        }
        
        data = JSON.parse(text); // Parse only if successful

    } catch(err) {
        // This catches both network errors and the explicit throw new Error(...) above
        console.error(`[PAGE COMPONENT ERROR] Failed to process event ${eventId}:`, err);
        throw err; // Re-throw the error to trigger Next.js error page
    }
    // 🛑 END OF MODIFIED BLOCK 🛑

  const event = data.event as EventDetail;
  
  // Fetching media for the event
  const mediaRes = await fetch(`${process.env.API_INTERNAL_BASE_URL}/uploads/${eventId}/media`, {cache: "no-store"})
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
      <div  className="border border-black-300 rounded-xl p-6 shadow-sm text-center space-y-3 bg-base-100">
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
{/* Interest toggle section */}
{/* Performing Interest toggle */}
<section className="w-full flex items-center justify-between mt-6 relative group">

  {/* Left-aligned text */}
  <h2 className="text-lg font-semibold text-gray-800">
    Performing Interest
  </h2>

  {/* Right-aligned toggle */}
  <div className="relative inline-flex">
    <InterestedToggle
      eventId={data.event.id}
      role={role}
      canSet={data.capabilities?.canSetInterest ?? false}
      initialInterested={!!data.interested}
    />

    {/* Tooltip for guests only */}
    {role === "GUEST" && (
      <div
        className="absolute right-0 top-full mt-2 hidden group-hover:flex
                   items-center gap-2 bg-base-100 text-base-content text-sm font-medium
                   border border-base-300 rounded-lg shadow-lg px-3 py-2 z-10 whitespace-nowrap"
      >
        <span role="img" aria-label="forbidden" className="text-error">🚫</span>
        Only members can toggle interest
      </div>
    )}
  </div>
</section>
  
{/* </section> */}

      {/* availbility */}
     <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Practice Availability</h2>
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
      <FinalMix title={finalTitle} url={finalUrl} role={role} eventId={eventId} />
      {/* <MediaGrid items={mediaItems}></MediaGrid> */}
      <MediaManager eventId={event.id} role={role} initialMedia={mediaItems} token={token}/>

      {/* Delete */}
      {isAdmin && <DeleteEvent eventId={eventId} role={role}/>}
    </div>
  );
}