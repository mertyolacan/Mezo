import MediaManager from "./MediaManager";

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Medya Yöneticisi</h1>
      <MediaManager />
    </div>
  );
}
