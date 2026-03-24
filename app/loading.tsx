export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-[420px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-12" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
