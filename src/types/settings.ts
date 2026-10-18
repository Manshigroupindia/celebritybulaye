export interface GeneralSettings {
  siteName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  defaultCountry: string;
  defaultTimeZone: string;
  defaultCurrency: string;
  copyrightText: string;
  websiteStatus: "active" | "maintenance";
}

export interface BrandingSettings {
  logo: string;
  footerLogo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentGoldColor: string;
}

export interface ContactSettings {
  phone: string;
  whatsapp: string;
  email: string;
  supportEmail: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  googleMapsUrl: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
}

export interface HomepageHeroSettings {
  eyebrow: string;
  heading: string;
  supportingText: string;
  backgroundImage: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface HomepageTrustStat {
  value: string;
  label: string;
  sub: string;
}

export interface HomepageTrustStatsSettings {
  stat1: HomepageTrustStat;
  stat2: HomepageTrustStat;
  stat3: HomepageTrustStat;
  stat4: HomepageTrustStat;
}

export interface HomepageSectionVisibilitySettings {
  popularCategories: boolean;
  featuredCelebrities: boolean;
  trendingCelebrities: boolean;
  howItWorks: boolean;
  whyChooseUs: boolean;
  eventTypes: boolean;
  testimonials: boolean;
  ctaSection: boolean;
}

export interface HomepageSettings {
  hero: HomepageHeroSettings;
  trustStats: HomepageTrustStatsSettings;
  sections: HomepageSectionVisibilitySettings;
}

export interface FooterSettings {
  footerDescription: string;
  copyrightText: string;
  showSocialLinks: boolean;
  showContactInfo: boolean;
  showCategoryLinks: boolean;
  showQuickLinks: boolean;
}

export interface LocalizationSettings {
  defaultLanguage: string;
  enableLanguageSelector: boolean;
  supportedLanguages: string[];
}

export interface SeoSettings {
  defaultTitle: string;
  defaultMetaDescription: string;
  defaultKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

export interface AllSiteSettings {
  general: GeneralSettings;
  branding: BrandingSettings;
  contact: ContactSettings;
  social: SocialSettings;
  homepage: HomepageSettings;
  footer: FooterSettings;
  localization: LocalizationSettings;
  seo: SeoSettings;
  updatedAt: string;
}
