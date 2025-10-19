"use client";

export default function EventError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-error">
        Something went wrong while loading this event
      </h1>
      <p className="opacity-80">{error.message}</p>
      <button onClick={reset} className="btn btn-primary mt-4">
        Try Again
      </button>
    </div>
  );
}