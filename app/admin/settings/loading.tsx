export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-40 mb-6" />
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-36 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-28 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" />
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded-xl w-28" />
      </div>
    </div>
  );
}
