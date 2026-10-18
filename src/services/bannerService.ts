import { HeroBanner, CreateBannerInput, UpdateBannerInput } from "@/types/banner";
import { initialBanners } from "@/data/initialBanners";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe,
} from "firebase/firestore";

export const BANNERS_STORAGE_KEY = "cb_banners_store_v1";
export const BANNERS_UPDATED_EVENT = "cb_banners_updated";

/**
 * Global in-memory cache for SSR / Node environment.
 */
let memoryCache: HeroBanner[] = [...initialBanners];

function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save banner document to Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function saveBannerToFirestore(banner: HeroBanner): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  const docRef = doc(db, "banners", banner.id);
  await setDoc(docRef, cleanFirestoreData(banner), { merge: true });
}

/**
 * Delete banner document from Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function deleteBannerFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  await deleteDoc(doc(db, "banners", id));
}

/**
 * Fetch all banners from Firestore.
 */
export async function fetchBannersFromFirestore(): Promise<HeroBanner[]> {
  if (!db) return getBanners();
  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "banners")
      : query(collection(db, "banners"), where("status", "==", "active"));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getBanners();
    }
    const list: HeroBanner[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as HeroBanner);
    });
    list.sort((a, b) => a.displayOrder - b.displayOrder);
    persistBanners(list);
    return list;
  } catch (err) {
    console.warn("[Firestore] Failed to fetch banners:", err);
    return getBanners();
  }
}

/**
 * Subscribe to real-time banner updates from Firestore.
 */
export function subscribeBannersFromFirestore(
  callback: (banners: HeroBanner[]) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;

  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "banners")
      : query(collection(db, "banners"), where("status", "==", "active"));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: HeroBanner[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as HeroBanner);
        });
        list.sort((a, b) => a.displayOrder - b.displayOrder);
        persistBanners(list);
        callback(list);
      },
      (err) => {
        console.warn("[Firestore] Banners real-time listener warning:", err.message);
        onError?.(err);
      }
    );
  } catch (err: unknown) {
    console.warn("[Firestore] Could not attach banners snapshot listener:", err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Read all banners from persistence.
 * Server: returns in-memory cache.
 * Client: reads localStorage (seeds if empty).
 */
export function getBanners(): HeroBanner[] {
  if (typeof window === "undefined") {
    return memoryCache.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  }

  try {
    const raw = localStorage.getItem(BANNERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(initialBanners));
      memoryCache = [...initialBanners];
      return initialBanners.slice().sort((a, b) => a.displayOrder - b.displayOrder);
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 0) {
      memoryCache = parsed;
      return parsed.slice().sort((a, b) => a.displayOrder - b.displayOrder);
    }

    memoryCache = [...initialBanners];
    return initialBanners.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (err) {
    console.error("Failed to read banners from localStorage:", err);
    return memoryCache.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

/**
 * Read only active banners sorted by display order.
 */
export function getActiveBanners(): HeroBanner[] {
  return getBanners().filter((b) => b.status === "active");
}

/**
 * Find a banner by ID.
 */
export function getBannerById(id: string): HeroBanner | undefined {
  return getBanners().find((b) => b.id === id);
}

/**
 * Persist banners list and broadcast change event to all components.
 */
function persistBanners(list: HeroBanner[]): void {
  const sorted = list.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  memoryCache = sorted;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(sorted));
      window.dispatchEvent(
        new CustomEvent(BANNERS_UPDATED_EVENT, { detail: sorted })
      );
    } catch (err) {
      console.error("Failed to persist banners to localStorage:", err);
    }
  }
}

/**
 * Create a new banner.
 */
/**
 * Create a new banner.
 */
export async function createBanner(
  input: CreateBannerInput
): Promise<{ success: boolean; banner?: HeroBanner; error?: string }> {
  try {
    if (!input.title?.trim()) {
      return { success: false, error: "Banner reference title is required." };
    }
    if (!input.desktopImage?.trim()) {
      return { success: false, error: "Desktop banner image is required." };
    }

    const current = getBanners();
    const newId = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Default display order to next highest number if not specified
    const maxOrder = current.reduce((max, b) => Math.max(max, b.displayOrder || 0), 0);
    const displayOrder =
      typeof input.displayOrder === "number" && !isNaN(input.displayOrder)
        ? input.displayOrder
        : maxOrder + 1;

    const newBanner: HeroBanner = {
      ...input,
      id: newId,
      title: input.title.trim(),
      desktopImage: input.desktopImage.trim(),
      mobileImage: input.mobileImage?.trim() || undefined,
      heading: input.heading?.trim() || undefined,
      description: input.description?.trim() || undefined,
      primaryCta: input.primaryCta || { enabled: false, label: "", href: "" },
      secondaryCta: input.secondaryCta || { enabled: false, label: "", href: "" },
      textPosition: input.textPosition || "left",
      overlayEnabled: input.overlayEnabled ?? true,
      overlayIntensity: input.overlayIntensity ?? 70,
      displayOrder,
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore first. Will throw if rejected by security rules or network failure
    await saveBannerToFirestore(newBanner);

    const updatedList = [...current, newBanner];
    persistBanners(updatedList);
    return { success: true, banner: newBanner };
  } catch (err: unknown) {
    console.error("createBanner error in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create banner in Firestore.",
    };
  }
}

/**
 * Update an existing banner.
 */
export async function updateBanner(
  id: string,
  updates: UpdateBannerInput
): Promise<{ success: boolean; banner?: HeroBanner; error?: string }> {
  try {
    const current = getBanners();
    const index = current.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, error: "Banner not found." };
    }

    const existing = current[index];
    const now = new Date().toISOString();

    const updatedBanner: HeroBanner = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? updates.title.trim() : existing.title,
      desktopImage:
        updates.desktopImage !== undefined
          ? updates.desktopImage.trim()
          : existing.desktopImage,
      mobileImage:
        updates.mobileImage !== undefined
          ? updates.mobileImage.trim() || undefined
          : existing.mobileImage,
      heading:
        updates.heading !== undefined
          ? updates.heading.trim() || undefined
          : existing.heading,
      description:
        updates.description !== undefined
          ? updates.description.trim() || undefined
          : existing.description,
      primaryCta: updates.primaryCta || existing.primaryCta,
      secondaryCta: updates.secondaryCta || existing.secondaryCta,
      textPosition: updates.textPosition || existing.textPosition,
      overlayEnabled: updates.overlayEnabled ?? existing.overlayEnabled,
      overlayIntensity: updates.overlayIntensity ?? existing.overlayIntensity,
      displayOrder:
        updates.displayOrder !== undefined ? updates.displayOrder : existing.displayOrder,
      status: updates.status || existing.status,
      updatedAt: now,
    };

    // Save to Firestore first
    await saveBannerToFirestore(updatedBanner);

    current[index] = updatedBanner;
    persistBanners(current);
    return { success: true, banner: updatedBanner };
  } catch (err: unknown) {
    console.error("updateBanner error in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update banner in Firestore.",
    };
  }
}

/**
 * Delete a banner by ID.
 */
export async function deleteBanner(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getBanners();
    const filtered = current.filter((b) => b.id !== id);
    if (filtered.length === current.length) {
      return { success: false, error: "Banner not found." };
    }

    // Delete from Firestore first
    await deleteBannerFromFirestore(id);

    persistBanners(filtered);
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteBanner error in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete banner from Firestore.",
    };
  }
}

/**
 * Toggle a banner's active/inactive status.
 */
export async function toggleBannerStatus(id: string): Promise<{
  success: boolean;
  banner?: HeroBanner;
  error?: string;
}> {
  const banner = getBannerById(id);
  if (!banner) {
    return { success: false, error: "Banner not found." };
  }
  const newStatus = banner.status === "active" ? "inactive" : "active";
  return await updateBanner(id, { status: newStatus });
}

/**
 * Reorder banners by providing an array of banner IDs in the desired order.
 */
export async function reorderBanners(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const current = getBanners();
    const idMap = new Map(current.map((b) => [b.id, b]));

    const updated: HeroBanner[] = [];
    orderedIds.forEach((id, index) => {
      const banner = idMap.get(id);
      if (banner) {
        const reordered = {
          ...banner,
          displayOrder: index + 1,
          updatedAt: new Date().toISOString(),
        };
        updated.push(reordered);
        idMap.delete(id);
      }
    });

    // Append any remaining banners not in orderedIds
    idMap.forEach((banner) => {
      const reordered = {
        ...banner,
        displayOrder: updated.length + 1,
      };
      updated.push(reordered);
    });

    // Persist all reordered banners to Firestore in parallel
    await Promise.all(updated.map((b) => saveBannerToFirestore(b)));

    persistBanners(updated);
    return { success: true };
  } catch (err: unknown) {
    console.error("reorderBanners error in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder banners in Firestore.",
    };
  }
}

/**
 * Reset banners to initial seed defaults.
 */
export function resetBannersToDefault(): {
  success: boolean;
  banners: HeroBanner[];
} {
  persistBanners(initialBanners);
  return { success: true, banners: initialBanners };
}
