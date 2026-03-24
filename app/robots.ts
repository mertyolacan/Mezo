import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mesopro.com.tr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin-login", "/api/", "/profile/", "/checkout/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
