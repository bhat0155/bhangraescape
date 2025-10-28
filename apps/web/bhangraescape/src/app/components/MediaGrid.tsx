"use client";

import type { MediaItem } from "@/app/types/media";

const FALLBACK_IMAGE_URL =
  "https://placehold.co/300x200?text=Image+Unavailable";
const FALLBACK_VIDEO_THUMB_URL =
  "https://placehold.co/300x200?text=Video";

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  if (!items || items.length === 0) {
    return (
      <section>
        
        <div className="text-sm opacity-70">No media yet.</div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
    

      {/* panel */}
      <div className="rounded-xl bg-base-100 shadow p-4">
        {/* simple responsive row that wraps on small screens */}
        <ul className="flex gap-4 overflow-x-auto sm:flex-wrap">
          {items.map((m) => {
            const isImage = m.type === "IMAGE";
            const title = m.title ?? (isImage ? "Event photo" : "Event video");

            if (isImage) {
              return (
                <li key={m.id} className="shrink-0 text-center">
                  <div className="relative">
                    <img
                      src={m.url}
                      alt={title}
                      width={160}
                      height={120}
                      className="rounded-lg object-cover w-40 h-28"
                      onError={(e) => {
                        // swap to fallback only once
                        if ((e.currentTarget as HTMLImageElement).src !== FALLBACK_IMAGE_URL) {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_URL;
                        }
                      }}
                    />
                  </div>
                  {m.title ? (
                    <div className="mt-1 text-xs font-medium opacity-80">{m.title}</div>
                  ) : null}
                </li>
              );
            }

            // VIDEO: show a click-to-open thumbnail with a play glyph
            const thumb = (m as MediaItem).thumbUrl || FALLBACK_VIDEO_THUMB_URL;

            return (
              <li key={m.id} className="shrink-0 text-center">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-block"
                  aria-label={`Open video: ${title}`}
                  title="Open video in new tab"
                >
                  <img
                    src={thumb}
                    alt={title}
                    width={160}
                    height={120}
                    className="rounded-lg object-cover w-40 h-28"
                    onError={(e) => {
                      if ((e.currentTarget as HTMLImageElement).src !== FALLBACK_VIDEO_THUMB_URL) {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_VIDEO_THUMB_URL;
                      }
                    }}
                  />
                  {/* Play icon overlay */}
                  <span
                    className="absolute inset-0 grid place-items-center"
                    aria-hidden="true"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white text-sm">
                      ▶
                    </span>
                  </span>
                </a>
                {m.title ? (
                  <div className="mt-1 text-xs font-medium opacity-80">{m.title}</div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}