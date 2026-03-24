import { z } from "zod";

// ── Global Settings (site_settings singleton) ────────────────────────────────
// Yalnızca SEO/meta/analytics alanları — iletişim/sosyal alanları Settings'e ait
export const GlobalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site adı zorunludur").max(255),
  titleSeparator: z.string().min(1).max(20).default(" | "),
  defaultDescription: z.string().max(500).optional().nullable(),
  defaultOgImage: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
  gaId: z.string().max(50).optional().nullable(),
  gscId: z.string().max(100).optional().nullable(),
  faviconUrl: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
  customScripts: z.object({
    head: z.string().optional().nullable(),
    bodyStart: z.string().optional().nullable(),
    bodyEnd: z.string().optional().nullable(),
  }).optional().default({}),
});

export type GlobalSettingsInput = z.infer<typeof GlobalSettingsSchema>;

// ── Content SEO (ürün / blog JSONB seoSettings) ─────────────────────────────
export const ContentSeoSchema = z.object({
  title: z.string().max(60, "Başlık 60 karakterden uzun olmamalıdır").optional().nullable(),
  description: z.string().max(160, "Açıklama 160 karakterden uzun olmamalıdır").optional().nullable(),
  keywords: z.array(z.string()).optional().default([]),
  ogImage: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
  noIndex: z.boolean().optional().default(false),
  canonicalUrl: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
});

export type ContentSeoInput = z.infer<typeof ContentSeoSchema>;

// ── Page SEO (seo_pages tablosu) ─────────────────────────────────────────────
export const PageSeoSchema = z.object({
  page: z.string().min(1).max(100),
  title: z.string().max(60).optional().nullable(),
  description: z.string().max(160).optional().nullable(),
  keywords: z.array(z.string()).optional().default([]),
  ogImage: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
  noIndex: z.boolean().optional().default(false),
  canonicalUrl: z.string().url("Geçerli bir URL girin").or(z.literal("")).optional().nullable(),
});

export type PageSeoInput = z.infer<typeof PageSeoSchema>;
