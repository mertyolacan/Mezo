export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex-shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-3/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/2" />
            <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
