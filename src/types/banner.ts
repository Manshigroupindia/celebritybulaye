export interface BannerCTA {
  enabled: boolean;
  label: string;
  href: string;
}

export type BannerTextPosition = "left" | "center" | "right";
export type BannerStatus = "active" | "inactive";

export interface HeroBanner {
  id: string;
  title: string;
  desktopImage: string;
  mobileImage?: string;
  heading?: string;
  description?: string;
  primaryCta?: BannerCTA;
  secondaryCta?: BannerCTA;
  textPosition: BannerTextPosition;
  overlayEnabled: boolean;
  overlayIntensity?: number; // 0 to 100 percentage
  displayOrder: number;
  status: BannerStatus;
  createdAt: string;
  updatedAt: string;
}

export type CreateBannerInput = Omit<HeroBanner, "id" | "createdAt" | "updatedAt">;
export type UpdateBannerInput = Partial<CreateBannerInput>;
