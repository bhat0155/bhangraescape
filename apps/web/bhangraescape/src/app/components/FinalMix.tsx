// Server Component: FinalMix.tsx
type Props = {
  title?: string | null;
  url?: string | null;
};

function providerFromUrl(url?: string | null): "SOUNDCLOUD" | "SPOTIFY" | "YOUTUBE" | "EXTERNAL" | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    if (h.includes("soundcloud")) return "SOUNDCLOUD";
    if (h.includes("spotify")) return "SPOTIFY";
    if (h.includes("youtube") || h.includes("youtu.be")) return "YOUTUBE";
    return "EXTERNAL";
  } catch {
    return "EXTERNAL";
  }
}

export default function FinalMix({ title, url }: Props) {
  const provider = providerFromUrl(url);

  return (
    <section>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Final Mix</h2>
      </header>

      {!url ? (
        <div className="mt-2 text-sm opacity-70">No final mix yet.</div>
      ) : (
        <div className="mt-3 rounded-xl bg-base-100 shadow p-4">
          <div className="flex items-center gap-3">
            {/* Small inline “wave” icon so we don’t pull any deps */}
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor"
                d="M3 12c2.5 0 2.5-4 5-4s2.5 4 5 4s2.5-4 5-4s2.5 4 5 4v2c-2.5 0-2.5-4-5-4s-2.5 4-5 4s-2.5-4-5-4s-2.5 4-5 4z"/>
            </svg>

            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {title || "Open final mix"}
              </div>
              <div className="text-xs opacity-70">
                {provider ? provider : "EXTERNAL"}
              </div>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary"
              aria-label="Open final mix"
              title="Open final mix"
            >
              Open
            </a>
          </div>
        </div>
      )}
    </section>
  );
}