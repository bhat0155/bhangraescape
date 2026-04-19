export default function LoadingEvent() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-base-300 rounded" />
      <div className="border-2 border-base-300 rounded-xl p-6 space-y-3 text-center">
        <div className="h-10 w-64 bg-base-300 rounded mx-auto" />
        <div className="h-4 w-40 bg-base-300 rounded mx-auto" />
        <div className="h-4 w-48 bg-base-300 rounded mx-auto" />
      </div>
      <div className="h-32 bg-base-300 rounded-xl" />
      <div className="h-12 bg-base-300 rounded-xl" />
      <div className="h-48 bg-base-300 rounded-xl" />
    </div>
  );
}