import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import SiteSettingsForm from "./SiteSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  rows.forEach((row) => { if (row.value) settings[row.key] = row.value; });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Site Ayarları</h1>
      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}
