import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/socket";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1 },
    {
      url: `${SITE_URL}/watch`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/create`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/top`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
