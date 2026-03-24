import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Ürün adı en az 2 karakter olmalı").max(255),
  slug: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  images: z.array(z.string()).default([]),
  categoryId: z.number().int().positive().optional().nullable(),
  brandId: z.number().int().positive().optional().nullable(),
  tags: z.array(z.string()).default([]),
  crossSellIds: z.array(z.number().int().positive()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  seoSettings: z.object({
    title: z.string().max(60).optional().nullable(),
    description: z.string().max(160).optional().nullable(),
    keywords: z.array(z.string()).optional().default([]),
    ogImage: z.string().optional().nullable(),
    noIndex: z.boolean().optional().default(false),
    canonicalUrl: z.string().optional().nullable(),
  }).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
