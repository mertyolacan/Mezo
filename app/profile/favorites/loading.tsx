export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-36 mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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
