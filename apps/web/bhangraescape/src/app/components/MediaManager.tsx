"use client"
import { useState } from "react";
import MediaGrid from "./MediaGrid";
import type { MediaItem } from "../types/media";

type Role = "GUEST" | "MEMBER" | "ADMIN";

type Props = {
  eventId: string;
  role: Role;                  // tighten the type
  initialMedia: MediaItem[];
};

export default function MediaManager({ eventId, role, initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [showUploader, setShowUploader] = useState(false);
  const isAdmin = role === "ADMIN";

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Videos &amp; Photos</h2>

        {/* Wrapper must be relative + group so the tooltip can anchor and show on hover */}
        <div className="relative group">
          <button
            type="button"
            className={`btn btn-primary btn-sm ${!isAdmin ? "btn-disabled opacity-70 cursor-not-allowed" : ""}`}
            disabled={!isAdmin}
            onClick={() => isAdmin && setShowUploader((prev) => !prev)}
            aria-expanded={showUploader}
            aria-controls="media-uploader"
            title={isAdmin ? "Add media to this event" : "Only admins can add media"}
          >
            {showUploader ? "Close" : "+ Add"}
          </button>

          {/* Hover tooltip for non-admins */}
          {!isAdmin && (
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-2
                         hidden group-hover:flex items-center gap-2
                         bg-white text-gray-700 text-sm font-medium
                         border border-gray-200 rounded-lg shadow-lg
                         px-3 py-2 z-10 whitespace-nowrap"
              role="note"
            >
              <span role="img" aria-label="forbidden" className="text-red-500">🚫</span>
              Only admins can add media
            </div>
          )}
        </div>
      </header>

      {/* Uploader container (we'll fill in next steps) */}
      
      {showUploader && isAdmin && (
        <div id="media-uploader" className="rounded-lg border border-base-300 p-3">
            {/* file picker and presign upload comes here */}
            <div className="text-sm opacity-70">File Picker will be placed here</div>
        </div>
      )}
      <MediaGrid items={media} />
    </section>
  );
}