// src/app/page.tsx
import EventCard from "./components/EventCard";
import { getRelativeTime } from "./lib/time";
import { EventSummary } from "./types/events";
import Link from "next/link";

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