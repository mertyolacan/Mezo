import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Settings } from "lucide-react";
import SiteSettingsForm from "./SiteSettingsForm";
import { type SiteSettingsInput } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const row = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1)
    .then((r) => r[0]);

  const initialSettings: SiteSettingsInput = {
    siteName:           row?.siteName           ?? "",
    siteTagline:        row?.siteTagline        ?? "",
    logoUrl:            row?.logoUrl            ?? "",
    contactPhone:       row?.contactPhone       ?? "",
    contactEmail:       row?.contactEmail       ?? "",
    contactAddress:     row?.contactAddress     ?? "",
    workingHours:       row?.workingHours       ?? "",
    socialInstagram:    row?.socialInstagram    ?? "",
    socialFacebook:     row?.socialFacebook     ?? "",
    socialTwitter:      row?.socialTwitter      ?? "",
    socialYoutube:      row?.socialYoutube      ?? "",
    socialLinkedin:     row?.socialLinkedin     ?? "",
    socialTiktok:       row?.socialTiktok       ?? "",
    socialWhatsapp:     row?.socialWhatsapp     ?? "",
    paymentCodEnabled:  row?.paymentCodEnabled  ?? true,
    paymentCardEnabled: row?.paymentCardEnabled ?? false,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
          <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Genel Ayarlar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Marka kimliği, iletişim, sosyal medya ve ödeme yapılandırması.</p>
        </div>
      </div>

      <SiteSettingsForm initialSettings={initialSettings} />
    </div>
  );
}
