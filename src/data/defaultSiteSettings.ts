import { AllSiteSettings } from "@/types/settings";

export const defaultSiteSettings: AllSiteSettings = {
  general: {
    siteName: "Celebrity Bulaye",
    tagline: "India's Premier Verified Celebrity Booking & Talent Management Platform",
    description:
      "Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate galas, concerts, brand collaborations, and private celebrations.",
    siteUrl: "",
    defaultCountry: "India",
    defaultTimeZone: "Asia/Kolkata (IST)",
    defaultCurrency: "INR (₹)",
    copyrightText: "© 2026 Celebrity Bulaye. All Rights Reserved.",
    websiteStatus: "active",
  },
  branding: {
    logo: "",
    footerLogo: "",
    favicon: "/favicon.ico",
    primaryColor: "#9B111E",
    secondaryColor: "#0B0F19",
    accentGoldColor: "#C5A059",
  },
  contact: {
    phone: "+91 98200 12345",
    whatsapp: "+91 98200 12345",
    email: "bookings@celebritybulaye.com",
    supportEmail: "support@celebritybulaye.com",
    address: "Level 14, Lotus Grandeur, Veera Desai Road, Andheri West",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400053",
    country: "India",
    googleMapsUrl: "https://maps.google.com",
  },
  social: {
    facebook: "https://facebook.com/celebritybulaye",
    instagram: "https://instagram.com/celebritybulaye",
    youtube: "https://youtube.com/@celebritybulaye",
    linkedin: "https://linkedin.com/company/celebritybulaye",
    twitter: "https://x.com/celebritybulaye",
    whatsapp: "https://wa.me/919820012345",
  },
  homepage: {
    hero: {
      eyebrow: "Premium Celebrity Booking Platform",
      heading: "Book Your Favorite Celebrity",
      supportingText:
        "Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate galas, concerts, brand collaborations, and private celebrations.",
      backgroundImage:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85",
      primaryButtonText: "Book a Celebrity",
      primaryButtonLink: "/book-celebrity",
      secondaryButtonText: "Explore Categories",
      secondaryButtonLink: "#categories-section",
    },
    trustStats: {
      stat1: { value: "500+", label: "Celebrities", sub: "Direct Artist Network" },
      stat2: { value: "1000+", label: "Successful Bookings", sub: "Pan-India & Global" },
      stat3: { value: "50+", label: "Cities", sub: "Event Destinations" },
      stat4: { value: "24/7", label: "Booking Assistance", sub: "Dedicated Talent Managers" },
    },
    sections: {
      popularCategories: true,
      featuredCelebrities: true,
      trendingCelebrities: true,
      howItWorks: true,
      whyChooseUs: true,
      eventTypes: true,
      testimonials: true,
      ctaSection: true,
    },
  },
  footer: {
    footerDescription:
      "Celebrity Bulaye is India's most trusted celebrity booking and talent liaison agency. We provide direct access to verified artists with transparent contracts, end-to-end event logistics, and white-glove booking assistance.",
    copyrightText: "© 2026 Celebrity Bulaye. All Rights Reserved.",
    showSocialLinks: true,
    showContactInfo: true,
    showCategoryLinks: true,
    showQuickLinks: true,
  },
  localization: {
    defaultLanguage: "en",
    enableLanguageSelector: true,
    supportedLanguages: ["en", "hi", "pa", "bn", "mr", "gu", "ta", "te"],
  },
  seo: {
    defaultTitle: "Celebrity Bulaye — Book Bollywood Stars, Singers & Influencers",
    defaultMetaDescription:
      "India's premier verified celebrity booking platform. Connect directly with Bollywood actors, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate events, and concerts.",
    defaultKeywords:
      "celebrity booking, book bollywood stars, wedding singers, hire comedian, influencer booking india, celebrity bulaye",
    ogTitle: "Celebrity Bulaye — Book Verified Celebrities",
    ogDescription:
      "Direct access to top Bollywood actors, playback singers, comedians & influencers for private & corporate events.",
    ogImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    favicon: "/favicon.ico",
  },
  updatedAt: "2026-10-18T10:00:00.000Z",
};
