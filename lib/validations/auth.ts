import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı").max(100),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "En az bir büyük harf içermeli")
    .regex(/[0-9]/, "En az bir rakam içermeli"),
  phone: z.string().min(10, "Geçerli bir telefon numarası girin"),
  address: z.object({
    street: z.string().min(5, "Adres en az 5 karakter olmalı"),
    district: z.string().min(2, "İlçe gerekli"),
    city: z.string().min(2, "Şehir gerekli"),
    postalCode: z.string().optional(),
  }).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "E-posta veya telefon numarası girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
