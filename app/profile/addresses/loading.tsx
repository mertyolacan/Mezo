export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-32" />
        <div className="h-9 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
              <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded-full w-20" />
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
