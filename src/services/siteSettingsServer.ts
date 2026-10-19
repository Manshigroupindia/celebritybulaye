import { AllSiteSettings } from "@/types/settings";
import { defaultSiteSettings } from "@/data/defaultSiteSettings";
import { db } from "@/lib/firebase";
import { getAdminFirestore } from "@/lib/firebaseAdmin";
import { doc, getDoc } from "firebase/firestore";

/**
 * Deep merge helper to ensure saved settings always have all keys populated.
 */
function mergeWithDefaults(saved: Partial<AllSiteSettings>): AllSiteSettings {
  return {
    general: { ...defaultSiteSettings.general, ...(saved.general || {}) },
    branding: { ...defaultSiteSettings.branding, ...(saved.branding || {}) },
    contact: { ...defaultSiteSettings.contact, ...(saved.contact || {}) },
    social: { ...defaultSiteSettings.social, ...(saved.social || {}) },
    homepage: {
      hero: {
        ...defaultSiteSettings.homepage.hero,
        ...(saved.homepage?.hero || {}),
      },
      trustStats: {
        stat1: {
          ...defaultSiteSettings.homepage.trustStats.stat1,
          ...(saved.homepage?.trustStats?.stat1 || {}),
        },
        stat2: {
          ...defaultSiteSettings.homepage.trustStats.stat2,
          ...(saved.homepage?.trustStats?.stat2 || {}),
        },
        stat3: {
          ...defaultSiteSettings.homepage.trustStats.stat3,
          ...(saved.homepage?.trustStats?.stat3 || {}),
        },
        stat4: {
          ...defaultSiteSettings.homepage.trustStats.stat4,
          ...(saved.homepage?.trustStats?.stat4 || {}),
        },
      },
      sections: {
        ...defaultSiteSettings.homepage.sections,
        ...(saved.homepage?.sections || {}),
      },
    },
    footer: { ...defaultSiteSettings.footer, ...(saved.footer || {}) },
    localization: {
      ...defaultSiteSettings.localization,
      ...(saved.localization || {}),
    },
    seo: { ...defaultSiteSettings.seo, ...(saved.seo || {}) },
    visitorCounter: {
      ...defaultSiteSettings.visitorCounter,
      ...(saved.visitorCounter || {}),
    },
    updatedAt: saved.updatedAt || defaultSiteSettings.updatedAt,
  };
}

/**
 * Safe server-side retrieval of site settings from Firestore for Next.js metadata and SSR.
 * Does NOT perform any writes to Firestore and does NOT expose admin credentials to clients.
 */
export async function getServerSiteSettings(): Promise<AllSiteSettings> {
  "use cache";
  // 1. Try Firebase Admin SDK if service account credentials exist in server environment
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb.collection("siteSettings").doc("main").get();
      if (snap.exists) {
        const data = snap.data() as Partial<AllSiteSettings>;
        return mergeWithDefaults(data);
      }
    }
  } catch {
    // Non-blocking fallback to Client SDK
  }

  // 2. Try Firebase Client/Web SDK (read permission is public under firestore.rules)
  try {
    if (db) {
      const docRef = doc(db, "siteSettings", "main");
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<AllSiteSettings>;
        return mergeWithDefaults(data);
      }
    }
  } catch (err) {
    console.warn("[SiteSettingsServer] Server-side Web SDK fetch warning:", err);
  }

  // 3. Fallback to default site settings
  return defaultSiteSettings;
}
