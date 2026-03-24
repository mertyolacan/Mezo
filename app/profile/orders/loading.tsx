export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-36 mb-6" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-32" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
            </div>
            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full w-24" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
