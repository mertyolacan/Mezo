export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-36" />
      </div>
      <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-4" />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="h-12 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-zinc-50 dark:border-zinc-800 px-6 flex items-center gap-4">
            <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-full flex-shrink-0" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-32" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-44" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
