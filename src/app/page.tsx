import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import { getServerSiteSettings } from "@/services/siteSettingsServer";
import { getSiteUrl, resolveOgImageUrl } from "@/lib/siteUrl";

export async function generateMetadata(): Promise<Metadata> {
  "use cache";
  const settings = await getServerSiteSettings();
  const siteUrl = getSiteUrl(settings?.general?.siteUrl);

  const title = "Celebrity-Bulaye | Book Celebrities for Your Events";
  const description =
    "Discover and book celebrities, actors, musicians, influencers and performers for events, shows and brand endorsements.";

  const ogTitle =
    settings?.seo?.ogTitle?.trim() ||
    settings?.seo?.defaultTitle?.trim() ||
    title;

  const ogDescription =
    settings?.seo?.ogDescription?.trim() ||
    settings?.seo?.defaultMetaDescription?.trim() ||
    description;

  const ogImageUrl = resolveOgImageUrl(settings?.seo?.ogImage, siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: settings?.general?.siteName || "Celebrity Bulaye",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Celebrity-Bulaye | Book Celebrities for Your Events",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}

export default function HomePage() {
  return <HomePageClient />;
}
