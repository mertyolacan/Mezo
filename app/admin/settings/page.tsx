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
    primaryColor:       row?.primaryColor       ?? "#4f46e5",
    secondaryColor:     row?.secondaryColor     ?? "#6366f1",
    tertiaryColor:      row?.tertiaryColor      ?? "#818cf8",
    accentColor:        row?.accentColor        ?? "#f43f5e",
    surfaceColor:       row?.surfaceColor       ?? "#f8fafc",
    borderRadius:       row?.borderRadius       ?? "0.75rem",
    buttonRadius:       row?.buttonRadius       ?? "0.5rem",
    cardRadius:         row?.cardRadius         ?? "1rem",
    inputRadius:        row?.inputRadius        ?? "0.75rem",
    navbarStyle:        row?.navbarStyle        ?? "glass",
    cardShadow:         row?.cardShadow         ?? "md",
    animationIntensity: row?.animationIntensity ?? "smooth",
    fontFamily:         row?.fontFamily         ?? "Inter",
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
