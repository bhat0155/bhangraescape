import { notFound } from "next/navigation";
import { REELS } from "@/app/data/reels";
import Link from "next/link";

export default function ReelPage({ params }: { params: { slug: string } }) {
  const reel = REELS.find((r) => r.slug === params.slug);
  if (!reel) notFound();

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Back button on top */}
      <div>
        <Link href="/" className="btn btn-outline btn-sm">← Back</Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold">{reel?.title}</h1>

      {/* Video wrapper: ~75% width, centered, keeps aspect ratio */}
      <div className="mx-auto w-11/12 md:w-5/6 lg:w-3/4">
        <div className="rounded-xl overflow-hidden bg-base-200 shadow aspect-video">
          <video
            controls
            preload="metadata"
            className="w-full h-full object-contain bg-black"
            src={reel?.src}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </main>
  );
}
     