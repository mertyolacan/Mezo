export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="flex flex-col gap-3">
          <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-2">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/4" />
          <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-3/4" />
          <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/3" />
          <div className="space-y-2 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
            ))}
          </div>
          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mt-4" />
        </div>
      </div>
    </div>
  );
}
