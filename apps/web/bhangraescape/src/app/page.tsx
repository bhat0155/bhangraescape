import EventCard from "./components/EventCard";
import { getRelativeTime } from "./lib/time";
import { EventSummary } from "./types/events"; // Corrected type import syntax
import Link from "next/link";
import Image from "next/image";

type EventListResponse = {
  items: EventSummary[];
};

export default async function HomePage() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const url = `${base}/events`;

  let data: EventListResponse | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
    }
    data = (await res.json()) as EventListResponse;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const eventsToRender = data?.items?.slice(0, 3) || [];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
      {/* (Optional) Hero goes above this later */}
      {/* FIX: Changed layout to a two-column grid for desktop (md:grid-cols-2) */}
      <section className="min-h-[60vh] rounded-xl overflow-hidden bg-base-200 relative grid grid-cols-1 md:grid-cols-2">
  
  {/* Left Column: Image (Takes up 1/2 width on medium screens and up) */}
  <div className="relative h-full min-h-[40vh] md:min-h-[60vh]">
    <Image
      src="/images/Hero2.jpeg"
      alt="BhangraEscape hero banner"
      fill
      priority
      // FIX: Changed back to object-cover to fill the entire column space
      className="object-cover object-center" 
      sizes="(max-width: 768px) 100vw, 50vw" // Image takes up 50% screen width on large screens
    />
    {/* Dark overlay over the image for contrast/style */}
    <div className="absolute inset-0 bg-black/30" />
  </div>

  {/* Right Column: Text Content (Takes up 1/2 width on medium screens and up) */}
  <div className="p-8 md:p-12 flex flex-col justify-center items-start text-base-content bg-base-200">
    <div className="max-w-xl space-y-4">
     <p className="text-sm font-semibold uppercase tracking-widest text-primary">
  Living through <span className="text-3xl font-extrabold">ਭੰਗੜਾ</span> 
</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
        Welcome to BhangraScape
      </h1>
      <p className="opacity-90">
        Experience the rhythm of traditional Bhangra.
      </p>
      <div className="pt-2 text-white">
        <Link href="/join" className="btn btn-primary">
          Join Our Team
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* Events preview section */}
      <section className="space-y-4">
        <header className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Events</h2>
            <p className="opacity-70">Catch our next performances.</p>
          </div>
          <Link href="/events" className="link link-primary">
            See all
          </Link>
        </header>

        {error && (
          <div role="alert" className="alert alert-error shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              <strong>Failed to load events:</strong> {error}
            </span>
          </div>
        )}

        {!error && eventsToRender.length === 0 ? (
          <div className="text-center py-12 bg-base-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold">No events yet</h3>
            <p className="opacity-70">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsToRender.map((item) => {
              const { label } = getRelativeTime(item.date);
              return <EventCard key={item.id} event={item} metaText={label} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}
