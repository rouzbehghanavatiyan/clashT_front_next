import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/socket";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/signUp", "/settings", "/chat"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
