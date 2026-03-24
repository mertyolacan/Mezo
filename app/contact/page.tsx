import type { Metadata } from "next";
import { getSeoMetadata } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("contact", {
    title: "İletişim",
    description: "Sorularınız için bize ulaşın, en kısa sürede yanıt verelim.",
  });
}

export default function ContactPage() {
  return <ContactForm />;
}
