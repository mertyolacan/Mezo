import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mesopro.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/api/*",
        "/checkout/*",
        "/profile/*",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password"
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
