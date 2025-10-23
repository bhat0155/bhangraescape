// Server Component
import Image from "next/image";
import type { MediaItem } from "@/app/types/media";

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  if (!items || items.length === 0) {
    return (
      <section>
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Videos & Photos</h2>
        </header>
        <div className="text-sm opacity-70">No media yet.</div>
      </section>
    );
  }

  // normal case: we have images/videos
  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Videos & Photos</h2>
      </header>

      {/* panel */}
      <div className="rounded-xl bg-base-100 shadow p-4">
        <ul className="flex gap-6 overflow-x-auto sm:flex-wrap">
          {items.map((m) => (
            <li key={m.id} className="shrink-0 text-center">
              {m.type === "IMAGE" ? (
                <Image
                  src={m.url}
                  alt={m.title ?? "Event media"}
                  width={96}
                  height={96}
                  className="rounded-lg object-cover"
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  width={96}
                  height={96}
                  className="rounded-lg"
                />
              )}
              {m.title ? (
                <div className="mt-1 text-xs font-medium opacity-80">
                  {m.title}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}