export function HomeSlideSkeleton() {
  return (
    <div className="flex h-full flex-col bg-black">
      {[0, 1].map((section) => (
        <div
          key={section}
          className="relative h-1/2 overflow-hidden border-b border-white/10 bg-black"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-900 via-black to-zinc-950" />
          <div className="absolute left-3 top-3 flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-700" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-700" />
              <div className="h-2 w-16 animate-pulse rounded bg-zinc-800" />
            </div>
          </div>
          <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-700" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-700" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-700" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
