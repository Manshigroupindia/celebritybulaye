/**
 * Canonical site URL and Open Graph image resolution helpers.
 */

export function getSiteUrl(configuredUrl?: string): string {
  // 1. Explicitly configured URL in Admin -> Site Settings
  if (configuredUrl && configuredUrl.trim()) {
    let clean = configuredUrl.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  // 2. Explicit environment variables
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) {
    let clean = process.env.NEXT_PUBLIC_SITE_URL.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  if (process.env.SITE_URL && process.env.SITE_URL.trim()) {
    let clean = process.env.SITE_URL.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  // 3. Vercel deployment environment variables
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  // 4. Default production website URL
  return "https://celebritybulaye.vercel.app";
}

/**
 * Ensures an OG image URL is an absolute HTTPS URL.
 * Falls back to local /og-image.png if empty or invalid.
 */
export function resolveOgImageUrl(rawImageUrl?: string, siteUrl?: string): string {
  const base = getSiteUrl(siteUrl);

  if (rawImageUrl && typeof rawImageUrl === "string") {
    const trimmed = rawImageUrl.trim();
    if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `${base}${trimmed}`;
    }
  }

  // Reliable local fallback
  return `${base}/og-image.png`;
}
