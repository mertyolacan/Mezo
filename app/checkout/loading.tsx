export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-40 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-36 mb-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
              <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            </div>
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-11 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
            <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-28 mb-2" />
            <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-32 mb-2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            ))}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
              <div className="flex justify-between"><div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" /><div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-16" /></div>
              <div className="flex justify-between"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-16" /><div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-20" /></div>
            </div>
            <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
