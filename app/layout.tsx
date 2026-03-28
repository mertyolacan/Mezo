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
    <html lang="tr" suppressHydrationWarning className={inter.variable} data-nav-style={settings?.navbarStyle || 'glass'}>
      <head>
        {/* Dynamic Theme Variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary-color: ${settings?.primaryColor || '#4f46e5'};
                --secondary-color: ${settings?.secondaryColor || '#6366f1'};
                --tertiary-color: ${settings?.tertiaryColor || '#818cf8'};
                --accent-color: ${settings?.accentColor || '#f43f5e'};
                --surface-color: ${settings?.surfaceColor || '#f8fafc'};
                --border-radius: ${settings?.borderRadius || '0.75rem'};
                --btn-radius: ${settings?.buttonRadius || '0.5rem'};
                --card-radius: ${settings?.cardRadius || '1rem'};
                --input-radius: ${settings?.inputRadius || '0.75rem'};
                --card-shadow: ${settings?.cardShadow === 'none' ? 'none' : settings?.cardShadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : settings?.cardShadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'};
                --nav-style: ${settings?.navbarStyle || 'glass'};
                --anim-intensity: ${settings?.animationIntensity || 'smooth'};
                ${settings?.fontFamily && settings.fontFamily !== 'Inter' ? `--font-family: ${settings.fontFamily}, sans-serif;` : '--font-family: var(--font-inter), sans-serif;'}
              }
              
              body { font-family: var(--font-family); }
              ${settings?.animationIntensity === 'none' ? '* { transition: none !important; animation: none !important; }' : ''}
            `,
          }}
        />

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

        <Providers 
          isLoggedIn={!!user} 
          userIsAdmin={user?.role === "admin"} 
          contact={contact}
          siteName={settings?.siteName}
          logoUrl={settings?.logoUrl}
        >
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
