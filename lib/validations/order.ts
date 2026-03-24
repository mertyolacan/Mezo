import { z } from "zod";

export const orderSchema = z.object({
  customerName: z.string().min(2, "Ad soyad en az 2 karakter olmalı"),
  customerEmail: z.string().email("Geçerli bir e-posta girin"),
  customerPhone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  shippingAddress: z.object({
    street: z.string().min(5, "Adres en az 5 karakter olmalı"),
    city: z.string().min(2, "Şehir gerekli"),
    district: z.string().min(2, "İlçe gerekli"),
    postalCode: z.string().optional(),
    country: z.string().default("Türkiye"),
  }),
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "card"]).default("cod"),
});

export type OrderInput = z.infer<typeof orderSchema>;
