import HomeFeed from "@/components/home/HomeFeed";
import { createMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Home",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
          }).replace(/</g, "\\u003c"),
        }}
      />
      <HomeFeed />
    </>
  );
}
