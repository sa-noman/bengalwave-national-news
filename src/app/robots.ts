import type { MetadataRoute } from "next";

// Preview sites and local development should never compete with production in search.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/auth/"] }],
    sitemap: "https://bengalwave.news/sitemap.xml",
  };
}
