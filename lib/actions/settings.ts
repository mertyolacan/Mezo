"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";
import { TAGS } from "@/lib/cache";

const SiteSettingsSchema = z.object({
  siteName:           z.string().min(1).max(255).optional().nullable(),
  siteTagline:        z.string().max(255).optional().nullable(),
  logoUrl:            z.string().url().or(z.literal("")).optional().nullable(),
  contactPhone:       z.string().max(50).optional().nullable(),
  contactEmail:       z.string().email().or(z.literal("")).optional().nullable(),
  contactAddress:     z.string().optional().nullable(),
  workingHours:       z.string().max(255).optional().nullable(),
  socialInstagram:    z.string().max(255).optional().nullable(),
  socialFacebook:     z.string().max(255).optional().nullable(),
  socialTwitter:      z.string().max(255).optional().nullable(),
  socialYoutube:      z.string().max(255).optional().nullable(),
  socialLinkedin:     z.string().max(255).optional().nullable(),
  socialTiktok:       z.string().max(255).optional().nullable(),
  socialWhatsapp:     z.string().max(50).optional().nullable(),
  paymentCodEnabled:  z.boolean().optional(),
  paymentCardEnabled: z.boolean().optional(),
});

export type SiteSettingsInput = z.infer<typeof SiteSettingsSchema>;

export async function updateSiteSettings(data: SiteSettingsInput) {
  const validated = SiteSettingsSchema.parse(data);

  // null → undefined (Drizzle .notNull() kolon uyumu)
  const payload = {
    siteName:           validated.siteName           ?? undefined,
    siteTagline:        validated.siteTagline        ?? undefined,
    logoUrl:            validated.logoUrl            ?? undefined,
    contactPhone:       validated.contactPhone       ?? undefined,
    contactEmail:       validated.contactEmail       ?? undefined,
    contactAddress:     validated.contactAddress     ?? undefined,
    workingHours:       validated.workingHours       ?? undefined,
    socialInstagram:    validated.socialInstagram    ?? undefined,
    socialFacebook:     validated.socialFacebook     ?? undefined,
    socialTwitter:      validated.socialTwitter      ?? undefined,
    socialYoutube:      validated.socialYoutube      ?? undefined,
    socialLinkedin:     validated.socialLinkedin     ?? undefined,
    socialTiktok:       validated.socialTiktok       ?? undefined,
    socialWhatsapp:     validated.socialWhatsapp     ?? undefined,
    paymentCodEnabled:  validated.paymentCodEnabled,
    paymentCardEnabled: validated.paymentCardEnabled,
    updatedAt:          new Date(),
  };

  const existing = await db
    .select({ id: siteSettings.id })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set(payload)
      .where(eq(siteSettings.id, 1));
  } else {
    await db
      .insert(siteSettings)
      .values({ id: 1, ...payload });
  }

  revalidateTag(TAGS.settings);
  revalidatePath("/", "layout");
  return { success: true };
}
