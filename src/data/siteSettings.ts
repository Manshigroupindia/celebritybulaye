import { SiteSettings } from "@/types";

export const siteSettings: SiteSettings = {
  logo: "/logo.svg",
  siteName: "Celebrity Bulaye",
  tagline: "India's Premier Verified Celebrity Booking & Talent Management Platform",
  phone: "+91 98200 12345",
  email: "bookings@celebritybulaye.com",
  address: "Level 14, Lotus Grandeur, Veera Desai Road, Andheri West, Mumbai, Maharashtra 400053",
  socialLinks: {
    facebook: "https://facebook.com/celebritybulaye",
    instagram: "https://instagram.com/celebritybulaye",
    youtube: "https://youtube.com/@celebritybulaye",
    linkedin: "https://linkedin.com/company/celebritybulaye",
  },
  heroTitle: "Book Your Favorite Celebrity",
  heroSubtitle:
    "Connect with verified Bollywood actors, singers, comedians, influencers, and sports icons for weddings, corporate events, concerts, brand collaborations, and private celebrations.",
  heroImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1920&q=85",
  footerText:
    "Celebrity Bulaye is India's most trusted celebrity booking and talent liaison agency. We provide direct access to verified artists with transparent contracts, end-to-end event logistics, and white-glove booking assistance.",
};

export const trustStats = [
  { value: "500+", label: "Celebrities", sub: "Verified Profiles" },
  { value: "1000+", label: "Successful Bookings", sub: "Across All Formats" },
  { value: "50+", label: "Cities Covered", sub: "India & International" },
  { value: "24/7", label: "Booking Assistance", sub: "Dedicated Talent Managers" },
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Explore",
    description: "Browse curated categories and discover verified celebrities tailored to your theme and audience.",
    icon: "Compass",
  },
  {
    step: "02",
    title: "Select",
    description: "Shortlist the celebrity or artist that perfectly matches your event type, budget, and location.",
    icon: "UserCheck",
  },
  {
    step: "03",
    title: "Send Inquiry",
    description: "Share your event date, venue, expected audience, and specific requirements in a quick inquiry.",
    icon: "FileText",
  },
  {
    step: "04",
    title: "Connect & Confirm",
    description: "Our dedicated talent manager coordinates dates, commercial terms, artist riders, and final contract.",
    icon: "ShieldCheck",
  },
];

export const whyChooseUsFeatures = [
  {
    title: "Verified Celebrity Profiles",
    description: "Direct management and verified liaison with zero unauthorized intermediaries or inflated commissions.",
    icon: "BadgeCheck",
  },
  {
    title: "Professional Booking Assistance",
    description: "Dedicated celebrity liaison managers coordinating everything from technical riders to green room logistics.",
    icon: "Headphones",
  },
  {
    title: "Transparent Inquiry Process",
    description: "Clear timelines, honest availability checks, and prompt quotations with full legal contracts.",
    icon: "FileCheck",
  },
  {
    title: "Wide Range of Categories",
    description: "From Bollywood A-listers and playback maestros to viral digital creators and stand-up comics.",
    icon: "Layers",
  },
  {
    title: "Personalized Event Support",
    description: "Tailored artist suggestions based on your guest demographic, venue layout, and budget parameters.",
    icon: "Sparkles",
  },
  {
    title: "Trusted Industry Network",
    description: "Over a decade of industry relationships with India's top talent agencies, managers, and production houses.",
    icon: "Building2",
  },
];
