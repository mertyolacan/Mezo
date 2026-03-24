export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-48 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-32 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
