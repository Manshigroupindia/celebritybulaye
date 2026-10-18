export interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  status?: "active" | "inactive";
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  count: number;
  displayCount?: string;
  displayOrder?: number;
  status?: "active" | "inactive";
  updatedAt?: string;
  subcategories: SubCategory[];
}

export interface Celebrity {
  id: string;
  name: string;
  slug: string;
  categoryId?: string;
  category: string;
  categorySlug: string;
  subcategoryId?: string;
  subcategory: string;
  subcategorySlug: string;
  location: string;
  livingLocation?: string;
  profileImage: string;
  mainImage?: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  biography?: string;
  bookingProtocols?: string; // Private rider / hospitality protocols, never exposed publicly
  specialties: string[];
  eventTypes: string[];
  availableFor?: string[];
  priceRange?: string;
  experience?: string;
  experienceYears?: number;
  languages?: string[];
  serviceAreas?: string[];
  status?: "draft" | "active" | "inactive";
  verified: boolean;
  featured: boolean;
  trending?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventTypeItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  popularCategories: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  event: string;
  location: string;
  rating: number;
  comment: string;
  celebrityBooked: string;
  avatar: string;
}

export interface SiteSettings {
  logo: string;
  siteName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  footerText: string;
}

export interface BookingInquiryFormData {
  celebrityId?: string;
  celebrityName: string;
  fullName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  audienceCount?: string;
  budgetRange?: string;
  message: string;
  agreedToTerms: boolean;
}

export interface ArtistApplicationFormData {
  fullName: string;
  professionalName: string;
  category: string;
  subcategory: string;
  phone: string;
  email: string;
  city: string;
  instagram: string;
  youtube: string;
  portfolioWebsite?: string;
  experienceYears: string;
  aboutYou: string;
  profileImage?: string;
  agreedToTerms: boolean;
}
