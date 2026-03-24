import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { db } from "@/lib/db";
import Providers from "@/components/shared/Providers";
import CookieConsent from "@/components/shared/CookieConsent";
import { getAuthUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/cache";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const siteName = settings?.siteName || "MesoPro";
  const titleSeparator = settings?.titleSeparator || " | ";
  const siteTagline = settings?.siteTagline || "Profesyonel Mezoterapi Ürünleri";
  const defaultTitle = `${siteName}${titleSeparator}${siteTagline}`;
  const defaultDesc = settings?.defaultDescription || "Klinikler ve doktorlar için profesyonel mezoterapi ürünleri.";
  const ogImage = settings?.defaultOgImage || undefined;

  return {
    title: {
      default: defaultTitle,
      template: `%s${titleSeparator}${siteName}`,
    },
    description: defaultDesc,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://mesopro.com"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      siteName: siteName,
      locale: "tr_TR",
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage ? [ogImage] : undefined,
    },
    robots: "index, follow",
    verification: {
      google: settings?.gscId || undefined,
    },
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getAuthUser(), getSiteSettings()]);
  
  const contact = {
    phone: settings?.contactPhone ?? null,
    email: settings?.contactEmail ?? null,
    whatsapp: settings?.socialWhatsapp ?? null,
  };

  return (
    <html lang="tr" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Theme Support */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem('mesopro-theme'),p=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';if((s||p)==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        
        {/* Custom Head Scripts */}
        {settings?.customScripts?.head && (
          <script dangerouslySetInnerHTML={{ __html: settings.customScripts.head }} />
        )}
      </head>
      <body className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 antialiased font-[var(--font-inter)]">
        {/* Custom Body Start Scripts */}
        {settings?.customScripts?.bodyStart && (
          <script dangerouslySetInnerHTML={{ __html: settings.customScripts.bodyStart }} />
        )}

        {/* Global Google Analytics */}
        {settings?.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaId}');
              `}
            </Script>
          </>
        )}

        <Providers isLoggedIn={!!user} userIsAdmin={user?.role === "admin"} contact={contact}>
          {children}
          <CookieConsent />
        </Providers>

        {/* Custom Body End Scripts */}
        {settings?.customScripts?.bodyEnd && (
          <script dangerouslySetInnerHTML={{ __html: settings.customScripts.bodyEnd }} />
        )}
      </body>
    </html>
  );
}
