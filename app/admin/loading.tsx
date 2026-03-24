export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-40" />
        <div className="h-9 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-28" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="h-12 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-zinc-50 dark:border-zinc-800 px-6 flex items-center gap-4">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-1/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-1/3" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-1/5 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
