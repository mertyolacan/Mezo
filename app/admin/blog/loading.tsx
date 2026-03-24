export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-40" />
        <div className="h-9 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-28" />
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="h-12 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-zinc-50 dark:border-zinc-800 px-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-1/3" />
            </div>
            <div className="h-6 bg-zinc-100 dark:bg-zinc-700 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
