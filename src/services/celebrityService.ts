import { Celebrity } from "@/types";
import { celebrities as initialSeedCelebrities } from "@/data/celebrities";
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

export const CELEBRITIES_STORAGE_KEY = "cb_celebrities_store_v1";
export const CELEBRITIES_UPDATED_EVENT = "cb_celebrities_updated";

function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Save a celebrity document to Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function saveCelebrityToFirestore(celebrity: Celebrity): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  const docRef = doc(db, "celebrities", celebrity.id);
  await setDoc(docRef, cleanFirestoreData(celebrity), { merge: true });
}

/**
 * Delete a celebrity document from Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function deleteCelebrityFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  await deleteDoc(doc(db, "celebrities", id));
}

/**
 * Fetch all celebrities from Firestore.
 */
export async function fetchCelebritiesFromFirestore(): Promise<Celebrity[]> {
  if (!db) return getStoredCelebrities();
  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "celebrities")
      : query(collection(db, "celebrities"), where("status", "==", "active"));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getStoredCelebrities();
    }
    const list: Celebrity[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Celebrity);
    });
    persistCelebrities(list);
    return list;
  } catch (err) {
    console.warn("[Firestore] Failed to fetch celebrities:", err);
    return getStoredCelebrities();
  }
}

/**
 * Subscribe to real-time updates for celebrities from Firestore.
 */
export function subscribeCelebritiesFromFirestore(
  callback: (celebrities: Celebrity[]) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;

  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "celebrities")
      : query(collection(db, "celebrities"), where("status", "==", "active"));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Celebrity[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Celebrity);
        });
        persistCelebrities(list);
        callback(list);
      },
      (err) => {
        console.warn("[Firestore] Celebrities real-time listener warning:", err.message);
        onError?.(err);
      }
    );
  } catch (err: unknown) {
    console.warn("[Firestore] Could not attach celebrities snapshot listener:", err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

export interface CelebrityFilterParams {
  category?: string;
  subcategory?: string;
  search?: string;
  location?: string;
  eventType?: string;
  status?: "all" | "active" | "inactive" | "draft";
  sortBy?: "featured" | "az" | "za" | "experience" | "recent";
}

/**
 * Deterministic base timestamp for demo seed data to ensure 100% hydration consistency between SSR and client.
 */
const SEED_BASE_TIMESTAMP = 1760500000000;

/**
 * Standardize initial demo celebrities so all CMS fields are populated.
 * Deterministic: no Date.now() or Math.random() during module evaluation.
 */
function normalizeSeedCelebrities(): Celebrity[] {
  return initialSeedCelebrities.map((c, idx) => {
    const experienceText =
      c.experience ||
      (c.experienceYears ? `${c.experienceYears} Years` : "8+ Years");

    const availableEvents =
      c.availableFor && c.availableFor.length > 0 ? c.availableFor : c.eventTypes;

    return {
      ...c,
      status: (c.status as "draft" | "active" | "inactive") || "active",
      livingLocation: c.livingLocation || c.location,
      mainImage: c.mainImage || c.profileImage,
      biography: c.biography || c.description,
      availableFor: availableEvents,
      experience: experienceText,
      serviceAreas: c.serviceAreas || ["Pan India", "International"],
      languages: c.languages || ["Hindi", "English"],
      bookingProtocols:
        c.bookingProtocols ||
        "Advance technical rider requires minimum 2-hour soundcheck before gala performance. Standard luxury suite accommodation and private airport transfers required for celebrity and management team.",
      createdAt:
        c.createdAt ||
        new Date(SEED_BASE_TIMESTAMP - (idx + 1) * 86400000 * 3).toISOString(),
      updatedAt:
        c.updatedAt ||
        new Date(SEED_BASE_TIMESTAMP - (idx + 1) * 3600000 * 4).toISOString(),
    };
  });
}

/**
 * Deterministic default normalized celebrities array.
 */
export const defaultNormalizedCelebrities: Celebrity[] = normalizeSeedCelebrities();

/**
 * Global in-memory cache for SSR / Node environment.
 */
let memoryCache: Celebrity[] = [...defaultNormalizedCelebrities];

/**
 * Generate a clean URL-friendly unique slug from string.
 */
export function generateCelebritySlug(name: string, excludeId?: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const existing = getStoredCelebrities();
  let candidate = base;
  let counter = 2;

  while (existing.some((c) => c.slug.toLowerCase() === candidate.toLowerCase() && c.id !== excludeId)) {
    candidate = `${base}-${counter}`;
    counter++;
  }

  return candidate;
}

/**
 * Read celebrities from persistence.
 * Client: reads localStorage (seeds if empty).
 * Server: returns in-memory cache.
 */
export function getStoredCelebrities(): Celebrity[] {
  if (typeof window === "undefined") {
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(CELEBRITIES_STORAGE_KEY);
    if (!raw) {
      // Seed initial normalized celebrities once
      localStorage.setItem(CELEBRITIES_STORAGE_KEY, JSON.stringify(defaultNormalizedCelebrities));
      memoryCache = [...defaultNormalizedCelebrities];
      return defaultNormalizedCelebrities;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache = parsed;
      return parsed;
    }
    memoryCache = [...defaultNormalizedCelebrities];
    return defaultNormalizedCelebrities;
  } catch (err) {
    console.error("Failed to read celebrities from localStorage:", err);
    return memoryCache;
  }
}

/**
 * Persist celebrities list and notify all listeners.
 */
export function persistCelebrities(list: Celebrity[]): void {
  memoryCache = [...list];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CELEBRITIES_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(
        new CustomEvent(CELEBRITIES_UPDATED_EVENT, { detail: list })
      );
    } catch (err) {
      console.error("Failed to persist celebrities to localStorage:", err);
    }
  }
}

/**
 * Synchronous query for celebrities (used by SSR and client components).
 */
export function getCelebritiesSync(
  params?: CelebrityFilterParams,
  options?: { includeInactive?: boolean }
): Celebrity[] {
  const all = getStoredCelebrities();
  const includeInactive = options?.includeInactive ?? false;

  let results = [...all];

  // Default: show only active for public unless includeInactive is specified
  if (!includeInactive) {
    results = results.filter((c) => (c.status ?? "active") === "active");
  } else if (params?.status && params.status !== "all") {
    results = results.filter((c) => (c.status ?? "active") === params.status);
  }

  if (!params) return results;

  if (params.search && params.search.trim() !== "") {
    const query = params.search.toLowerCase().trim();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        (c.subcategory && c.subcategory.toLowerCase().includes(query)) ||
        (c.location && c.location.toLowerCase().includes(query)) ||
        (c.livingLocation && c.livingLocation.toLowerCase().includes(query)) ||
        c.specialties.some((s) => s.toLowerCase().includes(query)) ||
        c.shortDescription.toLowerCase().includes(query)
    );
  }

  if (params.category && params.category !== "all") {
    const targetCat = params.category.toLowerCase();
    results = results.filter(
      (c) =>
        c.categorySlug.toLowerCase() === targetCat ||
        c.category.toLowerCase() === targetCat
    );
  }

  if (params.subcategory && params.subcategory !== "all") {
    const targetSub = params.subcategory.toLowerCase();
    results = results.filter(
      (c) =>
        c.subcategorySlug.toLowerCase() === targetSub ||
        (c.subcategory && c.subcategory.toLowerCase() === targetSub)
    );
  }

  if (params.location && params.location !== "all") {
    const targetLoc = params.location.toLowerCase();
    results = results.filter(
      (c) =>
        c.location.toLowerCase() === targetLoc ||
        (c.livingLocation && c.livingLocation.toLowerCase().includes(targetLoc))
    );
  }

  if (params.eventType && params.eventType !== "all") {
    const targetEvent = params.eventType.toLowerCase();
    results = results.filter((c) => {
      const events = c.availableFor || c.eventTypes || [];
      return events.some(
        (e) =>
          e.toLowerCase().includes(targetEvent) ||
          targetEvent.includes(e.toLowerCase())
      );
    });
  }

  if (params.sortBy) {
    if (params.sortBy === "az") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (params.sortBy === "za") {
      results.sort((a, b) => b.name.localeCompare(a.name));
    } else if (params.sortBy === "experience") {
      results.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else if (params.sortBy === "recent") {
      results.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } else {
      // featured first
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }

  return results;
}

/**
 * Async query wrapper for Celebrity queries (seamlessly swappable for Firestore).
 */
export async function getCelebrities(
  params?: CelebrityFilterParams,
  options?: { includeInactive?: boolean }
): Promise<Celebrity[]> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return getCelebritiesSync(params, options);
}

/**
 * Get active celebrities for public directory.
 */
export async function getActiveCelebrities(): Promise<Celebrity[]> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return getCelebritiesSync(undefined, { includeInactive: false });
}

/**
 * Get celebrity by slug.
 */
export function getCelebrityBySlugSync(
  slug: string,
  options?: { includeInactive?: boolean }
): Celebrity | null {
  const all = getStoredCelebrities();
  const includeInactive = options?.includeInactive ?? false;

  const found = all.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!found) return null;

  if (!includeInactive && (found.status ?? "active") !== "active") {
    return null;
  }

  return found;
}

export async function getCelebrityBySlug(
  slug: string,
  options?: { includeInactive?: boolean }
): Promise<Celebrity | null> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return getCelebrityBySlugSync(slug, options);
}

/**
 * Get celebrity by ID.
 */
export function getCelebrityByIdSync(id: string): Celebrity | null {
  const all = getStoredCelebrities();
  return all.find((c) => c.id === id) || null;
}

export async function getCelebrityById(id: string): Promise<Celebrity | null> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return getCelebrityByIdSync(id);
}

/**
 * Public category filters.
 */
export function getCelebritiesByCategory(categorySlug: string): Celebrity[] {
  return getCelebritiesSync({ category: categorySlug }, { includeInactive: false });
}

export function getCelebritiesBySubcategory(subcategorySlug: string): Celebrity[] {
  return getCelebritiesSync({ subcategory: subcategorySlug }, { includeInactive: false });
}

export async function getFeaturedCelebrities(): Promise<Celebrity[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const active = getCelebritiesSync(undefined, { includeInactive: false });
  return active.filter((c) => c.featured);
}

export async function getTrendingCelebrities(): Promise<Celebrity[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const active = getCelebritiesSync(undefined, { includeInactive: false });
  return active.filter((c) => c.trending);
}

export function getAllLocations(): string[] {
  const all = getStoredCelebrities().filter((c) => (c.status ?? "active") === "active");
  const locs = Array.from(
    new Set(all.map((c) => c.livingLocation || c.location).filter(Boolean))
  );
  return locs.sort();
}

/**
 * Mutation: Create a new celebrity profile.
 */
export type CreateCelebrityInput = Omit<Celebrity, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  slug?: string;
};

export async function createCelebrity(
  data: CreateCelebrityInput
): Promise<{ success: boolean; celebrity?: Celebrity; error?: string }> {
  try {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Celebrity name is required." };
    }
    if (!data.category || !data.category.trim()) {
      return { success: false, error: "Category is required." };
    }
    if (!data.shortDescription || !data.shortDescription.trim()) {
      return { success: false, error: "Short description is required." };
    }

    const all = getStoredCelebrities();
    const newId =
      data.id || `celeb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSlug = data.slug?.trim()
      ? generateCelebritySlug(data.slug, newId)
      : generateCelebritySlug(data.name, newId);

    const now = new Date().toISOString();

    const mainImg = data.mainImage || data.profileImage || "";
    const bio = data.biography || data.description || "";
    const loc = data.livingLocation || data.location || "Mumbai";
    const events = data.availableFor || data.eventTypes || [];

    const newCelebrity: Celebrity = {
      ...data,
      id: newId,
      slug: newSlug,
      name: data.name.trim(),
      category: data.category.trim(),
      categorySlug: data.categorySlug || data.category.toLowerCase().replace(/\s+/g, "-"),
      categoryId: data.categoryId || undefined,
      subcategory: data.subcategory || "",
      subcategorySlug: data.subcategorySlug || (data.subcategory ? data.subcategory.toLowerCase().replace(/\s+/g, "-") : ""),
      subcategoryId: data.subcategoryId || undefined,
      shortDescription: data.shortDescription.trim(),
      description: bio,
      biography: bio,
      bookingProtocols: data.bookingProtocols || "",
      location: loc,
      livingLocation: loc,
      profileImage: mainImg,
      mainImage: mainImg,
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      specialties: Array.isArray(data.specialties) ? data.specialties : [],
      eventTypes: events,
      availableFor: events,
      experience: data.experience || "5+ Years",
      experienceYears: data.experienceYears || parseInt(data.experience || "5", 10) || 5,
      languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : ["Hindi", "English"],
      serviceAreas: Array.isArray(data.serviceAreas) && data.serviceAreas.length > 0 ? data.serviceAreas : ["Pan India"],
      status: data.status || "active",
      verified: Boolean(data.verified),
      featured: Boolean(data.featured),
      trending: Boolean(data.trending),
      priceRange: data.priceRange || "On Request",
      rating: data.rating || 5.0,
      reviewsCount: data.reviewsCount || 1,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore first. Throws if rejected by security rules or network failure
    await saveCelebrityToFirestore(newCelebrity);

    const updatedList = [newCelebrity, ...all];
    persistCelebrities(updatedList);

    return { success: true, celebrity: newCelebrity };
  } catch (err: unknown) {
    console.error("Failed to create celebrity in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create celebrity profile in Firestore.",
    };
  }
}

/**
 * Mutation: Update an existing celebrity profile.
 */
export async function updateCelebrity(
  id: string,
  updates: Partial<Celebrity>
): Promise<{ success: boolean; celebrity?: Celebrity; error?: string }> {
  try {
    const all = getStoredCelebrities();
    const index = all.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: "Celebrity profile not found." };
    }

    const current = all[index];
    const now = new Date().toISOString();

    let newSlug = current.slug;
    if (updates.name && updates.name.trim() !== current.name && !updates.slug) {
      newSlug = generateCelebritySlug(updates.name, current.id);
    } else if (updates.slug && updates.slug !== current.slug) {
      newSlug = generateCelebritySlug(updates.slug, current.id);
    }

    const mainImg = updates.mainImage ?? updates.profileImage ?? current.mainImage ?? current.profileImage ?? "";
    const bio = updates.biography ?? updates.description ?? current.biography ?? current.description ?? "";
    const loc = updates.livingLocation ?? updates.location ?? current.livingLocation ?? current.location ?? "Mumbai";
    const events = updates.availableFor ?? updates.eventTypes ?? current.availableFor ?? current.eventTypes ?? [];

    const updatedCelebrity: Celebrity = {
      ...current,
      ...updates,
      slug: newSlug,
      mainImage: mainImg,
      profileImage: mainImg,
      biography: bio,
      description: bio,
      livingLocation: loc,
      location: loc,
      availableFor: events,
      eventTypes: events,
      updatedAt: now,
    };

    // Save to Firestore first
    await saveCelebrityToFirestore(updatedCelebrity);

    all[index] = updatedCelebrity;
    persistCelebrities(all);

    return { success: true, celebrity: updatedCelebrity };
  } catch (err: unknown) {
    console.error("Failed to update celebrity in Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update celebrity profile in Firestore.",
    };
  }
}

/**
 * Mutation: Delete a celebrity profile.
 */
export async function deleteCelebrity(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const all = getStoredCelebrities();
    const filtered = all.filter((c) => c.id !== id);

    if (filtered.length === all.length) {
      return { success: false, error: "Celebrity not found to delete." };
    }

    // Delete from Firestore first
    await deleteCelebrityFromFirestore(id);

    persistCelebrities(filtered);
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete celebrity from Firestore:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete celebrity from Firestore.",
    };
  }
}

/**
 * Mutation: Toggle celebrity status (active <-> inactive).
 */
export async function toggleCelebrityStatus(
  id: string
): Promise<{ success: boolean; celebrity?: Celebrity; error?: string }> {
  try {
    const all = getStoredCelebrities();
    const index = all.findIndex((c) => c.id === id);

    if (index === -1) {
      return { success: false, error: "Celebrity not found." };
    }

    const current = all[index];
    const newStatus = (current.status ?? "active") === "active" ? "inactive" : "active";

    return await updateCelebrity(id, { status: newStatus });
  } catch (err: unknown) {
    console.error("Failed to toggle status:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle status.",
    };
  }
}

/**
 * Mutation: Reset to default seed celebrities.
 */
export function resetToDefaultCelebrities(): { success: boolean; count: number } {
  persistCelebrities(defaultNormalizedCelebrities);
  return { success: true, count: defaultNormalizedCelebrities.length };
}
