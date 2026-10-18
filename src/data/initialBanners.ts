import { HeroBanner } from "@/types/banner";

export const initialBanners: HeroBanner[] = [
  {
    id: "banner-1",
    title: "Celebrity Booking Gala Main Banner",
    desktopImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=85",
    heading: "Book Your Favorite Celebrity",
    description:
      "Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate galas, concerts, brand collaborations, and private celebrations.",
    primaryCta: {
      enabled: true,
      label: "Book a Celebrity",
      href: "/book-celebrity",
    },
    secondaryCta: {
      enabled: true,
      label: "Explore Categories",
      href: "#categories-section",
    },
    textPosition: "left",
    overlayEnabled: true,
    overlayIntensity: 75,
    displayOrder: 1,
    status: "active",
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "banner-2",
    title: "Live Musical Concerts & Playback Singers",
    desktopImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=85",
    heading: "Electrifying Musical Evenings & Concerts",
    description:
      "Bring India's top playback sensations, Sufi bands, and Bollywood live performers directly to your festival, wedding sangeet, or corporate summit.",
    primaryCta: {
      enabled: true,
      label: "Explore Music Artists",
      href: "/category/music",
    },
    secondaryCta: {
      enabled: true,
      label: "Plan a Concert",
      href: "/contact",
    },
    textPosition: "left",
    overlayEnabled: true,
    overlayIntensity: 70,
    displayOrder: 2,
    status: "active",
    createdAt: "2026-10-18T10:30:00.000Z",
    updatedAt: "2026-10-18T10:30:00.000Z",
  },
  {
    id: "banner-3",
    title: "Stand-Up Comedians & Corporate Gala Nights",
    desktopImage:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=85",
    mobileImage:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=85",
    heading: "Unforgettable Laughter & Entertainment",
    description:
      "Hire trending stand-up comics and charismatic celebrity anchors to host your annual awards night, college fest, or private celebration.",
    primaryCta: {
      enabled: true,
      label: "View Comedians",
      href: "/category/comedian",
    },
    secondaryCta: {
      enabled: true,
      label: "Request Custom Quote",
      href: "/book-celebrity",
    },
    textPosition: "left",
    overlayEnabled: true,
    overlayIntensity: 80,
    displayOrder: 3,
    status: "active",
    createdAt: "2026-10-18T11:00:00.000Z",
    updatedAt: "2026-10-18T11:00:00.000Z",
  },
];
