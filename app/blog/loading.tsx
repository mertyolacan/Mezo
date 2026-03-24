export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-1/4 mb-8" />
      <div className="flex flex-col gap-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-6 items-start">
            <div className="w-32 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg w-3/4" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
