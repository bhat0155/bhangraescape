import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-4">
      <h1 className="text-3xl font-bold text-error">Event Not Found</h1>
      <p className="opacity-70">
        This event might have been removed or the link is incorrect.
      </p>
      <Link href="/events" className="btn btn-outline btn-primary mt-4">
        ← Back to Events
      </Link>
    </div>
  );
}