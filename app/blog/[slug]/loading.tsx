export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-24 mb-6" />
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-3/4 mb-3" />
      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-1/2 mb-6" />
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div className="space-y-2">
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-28" />
          <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" />
        </div>
      </div>
      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-10" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-4 bg-zinc-100 dark:bg-zinc-800 rounded ${i % 5 === 4 ? "w-2/3" : "w-full"}`} />
        ))}
        <div className="h-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-4 bg-zinc-100 dark:bg-zinc-800 rounded ${i % 4 === 3 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
