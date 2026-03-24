import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/shared/Providers";
import CookieConsent from "@/components/shared/CookieConsent";
import { getAuthUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MesoPro | Profesyonel Mezoterapi Ürünleri",
    template: "%s | MesoPro",
  },
  description: "Klinikler ve doktorlar için profesyonel mezoterapi ürünleri.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "MesoPro",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* FOUC prevention — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('mesopro-theme'),p=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased font-[var(--font-inter)]">
        <Providers isLoggedIn={!!user}>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
