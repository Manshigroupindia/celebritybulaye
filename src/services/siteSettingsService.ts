import { AllSiteSettings } from "@/types/settings";
import { defaultSiteSettings } from "@/data/defaultSiteSettings";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";

export const SITE_SETTINGS_STORAGE_KEY = "cb_site_settings_store_v1";
export const SITE_SETTINGS_UPDATED_EVENT = "cb_site_settings_updated";

/**
 * Global in-memory cache for SSR / Node environment.
 */
let memoryCache: AllSiteSettings = { ...defaultSiteSettings };

function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save site settings document to Firestore and synchronize visitor stats.
 */
export async function saveSiteSettingsToFirestore(settings: AllSiteSettings): Promise<void> {
  if (!db) {
    throw new Error("Firebase database is not initialized.");
  }
  const docRef = doc(db, "siteSettings", "main");
  await setDoc(
    docRef,
    cleanFirestoreData({
      ...settings,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );

  // Synchronize dedicated siteStats/visitors document
  if (settings.visitorCounter) {
    try {
      const statsRef = doc(db, "siteStats", "visitors");
      await setDoc(
        statsRef,
        {
          count: settings.visitorCounter.currentCount,
          enabled: settings.visitorCounter.enabled,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("[Firestore] Failed to sync siteStats/visitors:", err);
    }
  }
}

/**
 * Fetch site settings from Firestore (including latest real-time visitor stats).
 */
export async function fetchSiteSettingsFromFirestore(): Promise<AllSiteSettings> {
  if (!db) return getSiteSettingsSync();
  try {
    const docRef = doc(db, "siteSettings", "main");
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data() as Partial<AllSiteSettings>;

      // Optionally fetch real-time visitor count from dedicated siteStats/visitors doc
      try {
        const statsRef = doc(db, "siteStats", "visitors");
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const statsData = statsSnap.data();
          if (statsData) {
            data.visitorCounter = {
              enabled: statsData.enabled !== undefined ? !!statsData.enabled : (data.visitorCounter?.enabled ?? true),
              startingCount: data.visitorCounter?.startingCount ?? statsData.count ?? 10000,
              currentCount: typeof statsData.count === "number" ? statsData.count : (data.visitorCounter?.currentCount ?? 10000),
            };
          }
        }
      } catch (statsErr) {
        // Non-blocking: fallback to siteSettings.visitorCounter
      }

      const merged = mergeWithDefaults(data);
      memoryCache = merged;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
      return merged;
    }
    return getSiteSettingsSync();
  } catch (err) {
    console.warn("[Firestore] Failed to fetch siteSettings:", err);
    return getSiteSettingsSync();
  }
}

/**
 * Subscribe to real-time site settings from Firestore.
 */
export function subscribeSiteSettingsFromFirestore(
  callback: (settings: AllSiteSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;

  try {
    return onSnapshot(
      doc(db, "siteSettings", "main"),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<AllSiteSettings>;
          const merged = mergeWithDefaults(data);
          memoryCache = merged;
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
          }
          callback(merged);
        }
      },
      (err) => {
        console.warn("[Firestore] siteSettings listener warning:", err.message);
        onError?.(err);
      }
    );
  } catch (err: unknown) {
    console.warn("[Firestore] Could not attach siteSettings snapshot listener:", err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Deep merge helper to ensure saved settings always have all keys populated
 * even when new settings sections or fields are introduced.
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
 * Read site settings synchronously.
 * Server: returns in-memory cache.
 * Client: reads localStorage (seeds if empty).
 */
export function getSiteSettingsSync(): AllSiteSettings {
  if (typeof window === "undefined") {
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(defaultSiteSettings)
      );
      memoryCache = { ...defaultSiteSettings };
      return defaultSiteSettings;
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const merged = mergeWithDefaults(parsed);
      memoryCache = merged;
      return merged;
    }

    memoryCache = { ...defaultSiteSettings };
    return defaultSiteSettings;
  } catch (err) {
    console.error("Failed to read site settings from localStorage:", err);
    return memoryCache;
  }
}

/**
 * Persist site settings and broadcast changes to all listeners.
 */
export function persistSiteSettings(settings: AllSiteSettings): void {
  const merged = mergeWithDefaults(settings);
  memoryCache = merged;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        SITE_SETTINGS_STORAGE_KEY,
        JSON.stringify(merged)
      );
      window.dispatchEvent(
        new CustomEvent(SITE_SETTINGS_UPDATED_EVENT, { detail: merged })
      );
    } catch (err) {
      console.error("Failed to persist site settings to localStorage:", err);
    }
  }

  saveSiteSettingsToFirestore(merged).catch(() => {});
}

/**
 * Update partial site settings.
 */
export async function updateSiteSettings(
  updates: Partial<AllSiteSettings>
): Promise<{ success: boolean; settings?: AllSiteSettings; error?: string }> {
  try {
    const current = getSiteSettingsSync();
    const updated: AllSiteSettings = {
      ...current,
      ...updates,
      general: updates.general
        ? { ...current.general, ...updates.general }
        : current.general,
      branding: updates.branding
        ? { ...current.branding, ...updates.branding }
        : current.branding,
      contact: updates.contact
        ? { ...current.contact, ...updates.contact }
        : current.contact,
      social: updates.social
        ? { ...current.social, ...updates.social }
        : current.social,
      homepage: updates.homepage
        ? {
            hero: updates.homepage.hero
              ? { ...current.homepage.hero, ...updates.homepage.hero }
              : current.homepage.hero,
            trustStats: updates.homepage.trustStats
              ? { ...current.homepage.trustStats, ...updates.homepage.trustStats }
              : current.homepage.trustStats,
            sections: updates.homepage.sections
              ? { ...current.homepage.sections, ...updates.homepage.sections }
              : current.homepage.sections,
          }
        : current.homepage,
      footer: updates.footer
        ? { ...current.footer, ...updates.footer }
        : current.footer,
      localization: updates.localization
        ? { ...current.localization, ...updates.localization }
        : current.localization,
      seo: updates.seo
        ? { ...current.seo, ...updates.seo }
        : current.seo,
      visitorCounter: updates.visitorCounter
        ? { ...current.visitorCounter, ...updates.visitorCounter }
        : current.visitorCounter,
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore first. Will throw if rejected by security rules or network failure
    await saveSiteSettingsToFirestore(updated);

    // Persist to local memory and storage only after Firestore succeeds
    persistSiteSettings(updated);
    return { success: true, settings: updated };
  } catch (err: unknown) {
    console.error("Failed to update site settings in Firestore:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update website configuration in Firestore.",
    };
  }
}

/**
 * Reset site settings back to default initial values.
 */
export async function resetSiteSettingsToDefault(): Promise<{
  success: boolean;
  settings?: AllSiteSettings;
  error?: string;
}> {
  try {
    const reset = {
      ...defaultSiteSettings,
      updatedAt: new Date().toISOString(),
    };
    await saveSiteSettingsToFirestore(reset);
    persistSiteSettings(reset);
    return { success: true, settings: reset };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reset site settings in Firestore.",
    };
  }
}
