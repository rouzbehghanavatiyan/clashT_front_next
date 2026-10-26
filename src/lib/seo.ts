import type { Metadata } from "next";
import { SITE_URL } from "@/lib/socket";

export const SITE_NAME = "Clash Talent";
export const SITE_DESCRIPTION =
  "Watch talent matchups, create challenges, and climb the leaderboard on Clash Talent.";

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function createMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "profile" | "article";
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image || absoluteUrl("/assets/images/logocircle.png");

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "en_US",
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
