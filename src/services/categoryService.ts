import { Category, SubCategory } from "@/types";
import { categories as initialSeedCategories } from "@/data/categories";
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

export const CATEGORIES_STORAGE_KEY = "cb_categories_store_v1";
export const CATEGORIES_UPDATED_EVENT = "cb_categories_updated";

/**
 * Global in-memory cache for SSR / Node environment.
 */
let memoryCache: Category[] = [...initialSeedCategories];

/**
 * Generate a clean URL-friendly slug from string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Asynchronously save category document to Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function saveCategoryToFirestore(category: Category): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  const docRef = doc(db, "categories", category.id);
  await setDoc(
    docRef,
    cleanFirestoreData({
      ...category,
      updatedAt: category.updatedAt || new Date().toISOString(),
    }),
    { merge: true }
  );
}

/**
 * Asynchronously delete category document from Firestore.
 * Throws an error on failure so caller can inform user and roll back.
 */
export async function deleteCategoryFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error("Firestore database is not initialized.");
  await deleteDoc(doc(db, "categories", id));
}

/**
 * Fetch all categories directly from Firestore.
 * Falls back to stored/seed categories if Firestore has no records or is unreachable.
 */
export async function fetchCategoriesFromFirestore(): Promise<Category[]> {
  if (!db) return getStoredCategories();
  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "categories")
      : query(collection(db, "categories"), where("status", "==", "active"));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getStoredCategories();
    }
    const list: Category[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Category);
    });
    list.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    persistCategories(list);
    return list;
  } catch (err) {
    console.warn("[Firestore] Failed to fetch categories from Firestore:", err);
    return getStoredCategories();
  }
}

/**
 * Subscribe to real-time updates for categories in Firestore.
 */
export function subscribeCategoriesFromFirestore(
  callback: (categories: Category[]) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!db || typeof window === "undefined") return null;

  try {
    const isAuth = Boolean(auth?.currentUser);
    const q = isAuth
      ? collection(db, "categories")
      : query(collection(db, "categories"), where("status", "==", "active"));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: Category[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Category);
        });
        list.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        persistCategories(list);
        callback(list);
      },
      (err) => {
        console.warn("[Firestore] Categories real-time listener error:", err.message);
        onError?.(err);
      }
    );
  } catch (err: unknown) {
    console.warn("[Firestore] Could not attach categories snapshot listener:", err);
    onError?.(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Read categories from persistence.
 * Client: reads localStorage (seeds if empty).
 * Server: returns in-memory cache.
 */
export function getStoredCategories(): Category[] {
  if (typeof window === "undefined") {
    return memoryCache;
  }

  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) {
      // Seed initial categories once
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(initialSeedCategories));
      return initialSeedCategories;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialSeedCategories;
  } catch (err) {
    console.error("Failed to read categories from localStorage:", err);
    return initialSeedCategories;
  }
}

/**
 * Persist categories list and notify all listeners.
 */
export function persistCategories(list: Category[]): void {
  memoryCache = [...list];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT, { detail: list }));
    } catch (err) {
      console.error("Failed to persist categories to localStorage:", err);
    }
  }
}

/**
 * Get all categories (optional filter for active only).
 */
export function getCategories(options?: { includeInactive?: boolean }): Category[] {
  const all = getStoredCategories();
  const includeInactive = options?.includeInactive ?? true;

  const filtered = includeInactive ? all : all.filter((c) => (c.status ?? "active") === "active");

  return [...filtered].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}

/**
 * Get active categories with active subcategories (for public browsing).
 */
export function getActiveCategories(): Category[] {
  const all = getStoredCategories();
  return all
    .filter((c) => (c.status ?? "active") === "active")
    .map((cat) => ({
      ...cat,
      subcategories: (cat.subcategories || []).filter((s) => (s.status ?? "active") === "active"),
    }))
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}

/**
 * Get category by slug.
 */
export function getCategoryBySlug(
  slug: string,
  options?: { includeInactive?: boolean }
): Category | undefined {
  const all = getCategories(options);
  return all.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Get category by ID.
 */
export function getCategoryById(id: string): Category | undefined {
  const all = getStoredCategories();
  return all.find((c) => c.id === id);
}

/**
 * Get subcategories of a category.
 */
export function getSubcategories(
  parentCategoryIdOrSlug: string,
  options?: { includeInactive?: boolean }
): SubCategory[] {
  const all = getStoredCategories();
  const parent = all.find(
    (c) =>
      c.id === parentCategoryIdOrSlug ||
      c.slug.toLowerCase() === parentCategoryIdOrSlug.toLowerCase()
  );

  if (!parent) return [];
  const subs = parent.subcategories || [];
  const includeInactive = options?.includeInactive ?? true;

  const filtered = includeInactive ? subs : subs.filter((s) => (s.status ?? "active") === "active");
  return [...filtered].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
}

/**
 * CREATE a Category.
 */
export async function createCategory(data: {
  name: string;
  slug?: string;
  image: string;
  description: string;
  displayCount?: string;
  displayOrder?: number;
  status?: "active" | "inactive";
}): Promise<Category> {
  const all = getStoredCategories();

  const title = data.name.trim();
  if (!title) throw new Error("Category title is required.");
  if (!data.description?.trim()) throw new Error("Category description is required.");
  if (!data.image?.trim()) throw new Error("Category image is required.");

  const slug = (data.slug?.trim() || generateSlug(title)).toLowerCase();

  // Validate duplicate slug
  if (all.some((c) => c.slug.toLowerCase() === slug)) {
    throw new Error(`A category with slug "${slug}" already exists. Please choose a unique slug.`);
  }

  const newCategory: Category = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: title,
    slug,
    image: data.image.trim(),
    description: data.description.trim(),
    count: 0,
    displayCount: data.displayCount?.trim() || "0+ Celebrities",
    displayOrder: data.displayOrder ?? all.length + 1,
    status: data.status || "active",
    updatedAt: new Date().toISOString(),
    subcategories: [],
  };

  // Save to Firestore first. Will throw if rejected by security rules
  await saveCategoryToFirestore(newCategory);

  const updatedList = [...all, newCategory];
  persistCategories(updatedList);
  return newCategory;
}

/**
 * UPDATE a Category.
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, "id" | "subcategories">>
): Promise<Category> {
  const all = getStoredCategories();
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found.");

  const current = all[index];

  // If slug is being updated, check uniqueness
  if (updates.slug && updates.slug.toLowerCase() !== current.slug.toLowerCase()) {
    const newSlug = generateSlug(updates.slug);
    if (all.some((c) => c.id !== id && c.slug.toLowerCase() === newSlug)) {
      throw new Error(`Slug "${newSlug}" is already taken by another category.`);
    }
    updates.slug = newSlug;
  }

  const updated: Category = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Save to Firestore first
  await saveCategoryToFirestore(updated);

  all[index] = updated;
  persistCategories(all);
  return updated;
}

/**
 * DELETE a Category.
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; deleted: Category }> {
  const all = getStoredCategories();
  const category = all.find((c) => c.id === id);
  if (!category) throw new Error("Category not found.");

  // Delete from Firestore first
  await deleteCategoryFromFirestore(id);

  const updated = all.filter((c) => c.id !== id);
  persistCategories(updated);
  return { success: true, deleted: category };
}

/**
 * Toggle Category Status (Active <-> Inactive).
 */
export async function toggleCategoryStatus(id: string): Promise<Category> {
  const all = getStoredCategories();
  const cat = all.find((c) => c.id === id);
  if (!cat) throw new Error("Category not found.");

  const newStatus: "active" | "inactive" = cat.status === "inactive" ? "active" : "inactive";
  return await updateCategory(id, { status: newStatus });
}

/**
 * CREATE a Subcategory under a parent Category.
 */
export async function createSubcategory(
  parentCategoryId: string,
  data: {
    name: string;
    slug?: string;
    description: string;
    image?: string;
    displayOrder?: number;
    status?: "active" | "inactive";
  }
): Promise<SubCategory> {
  const all = getStoredCategories();
  const parent = all.find((c) => c.id === parentCategoryId);
  if (!parent) throw new Error("Parent category not found.");

  const title = data.name.trim();
  if (!title) throw new Error("Subcategory title is required.");
  if (!data.description?.trim()) throw new Error("Subcategory description is required.");

  const slug = (data.slug?.trim() || generateSlug(title)).toLowerCase();

  // Validate duplicate slug under same parent
  const existingSubs = parent.subcategories || [];
  if (existingSubs.some((s) => s.slug.toLowerCase() === slug)) {
    throw new Error(`A subcategory with slug "${slug}" already exists under ${parent.name}.`);
  }

  const newSub: SubCategory = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: title,
    slug,
    description: data.description.trim(),
    image: data.image?.trim() || undefined,
    displayOrder: data.displayOrder ?? existingSubs.length + 1,
    status: data.status || "active",
    updatedAt: new Date().toISOString(),
  };

  const updatedParent: Category = {
    ...parent,
    subcategories: [...existingSubs, newSub],
    updatedAt: new Date().toISOString(),
  };

  // Save updated parent to Firestore first
  await saveCategoryToFirestore(updatedParent);

  const parentIdx = all.findIndex((c) => c.id === parentCategoryId);
  all[parentIdx] = updatedParent;
  persistCategories(all);
  return newSub;
}

/**
 * UPDATE a Subcategory.
 */
export async function updateSubcategory(
  parentCategoryId: string,
  subcategoryIdOrSlug: string,
  updates: Partial<SubCategory>
): Promise<SubCategory> {
  const all = getStoredCategories();
  const parent = all.find((c) => c.id === parentCategoryId);
  if (!parent) throw new Error("Parent category not found.");

  const subs = parent.subcategories || [];
  const index = subs.findIndex(
    (s) => s.id === subcategoryIdOrSlug || s.slug.toLowerCase() === subcategoryIdOrSlug.toLowerCase()
  );
  if (index === -1) throw new Error("Subcategory not found.");

  const current = subs[index];

  // If slug is updated, check collision under this parent
  if (updates.slug && updates.slug.toLowerCase() !== current.slug.toLowerCase()) {
    const newSlug = generateSlug(updates.slug);
    if (subs.some((s, idx) => idx !== index && s.slug.toLowerCase() === newSlug)) {
      throw new Error(`Subcategory slug "${newSlug}" already exists under ${parent.name}.`);
    }
    updates.slug = newSlug;
  }

  const updated: SubCategory = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const updatedSubs = [...subs];
  updatedSubs[index] = updated;

  const updatedParent: Category = {
    ...parent,
    subcategories: updatedSubs,
    updatedAt: new Date().toISOString(),
  };

  // Save updated parent to Firestore first
  await saveCategoryToFirestore(updatedParent);

  const parentIdx = all.findIndex((c) => c.id === parentCategoryId);
  all[parentIdx] = updatedParent;
  persistCategories(all);
  return updated;
}

/**
 * DELETE a Subcategory.
 */
export async function deleteSubcategory(
  parentCategoryId: string,
  subcategoryIdOrSlug: string
): Promise<{ success: boolean; deleted: SubCategory }> {
  const all = getStoredCategories();
  const parent = all.find((c) => c.id === parentCategoryId);
  if (!parent) throw new Error("Parent category not found.");

  const subs = parent.subcategories || [];
  const target = subs.find(
    (s) => s.id === subcategoryIdOrSlug || s.slug.toLowerCase() === subcategoryIdOrSlug.toLowerCase()
  );
  if (!target) throw new Error("Subcategory not found.");

  const updatedSubs = subs.filter(
    (s) => s.id !== subcategoryIdOrSlug && s.slug.toLowerCase() !== subcategoryIdOrSlug.toLowerCase()
  );

  const updatedParent: Category = {
    ...parent,
    subcategories: updatedSubs,
    updatedAt: new Date().toISOString(),
  };

  // Save updated parent to Firestore first
  await saveCategoryToFirestore(updatedParent);

  const parentIdx = all.findIndex((c) => c.id === parentCategoryId);
  all[parentIdx] = updatedParent;
  persistCategories(all);
  return { success: true, deleted: target };
}

/**
 * Toggle Subcategory Status.
 */
export async function toggleSubcategoryStatus(
  parentCategoryId: string,
  subcategoryIdOrSlug: string
): Promise<SubCategory> {
  const all = getStoredCategories();
  const parent = all.find((c) => c.id === parentCategoryId);
  if (!parent) throw new Error("Parent category not found.");

  const subs = parent.subcategories || [];
  const target = subs.find(
    (s) => s.id === subcategoryIdOrSlug || s.slug.toLowerCase() === subcategoryIdOrSlug.toLowerCase()
  );
  if (!target) throw new Error("Subcategory not found.");

  const newStatus: "active" | "inactive" = target.status === "inactive" ? "active" : "inactive";
  return await updateSubcategory(parentCategoryId, subcategoryIdOrSlug, { status: newStatus });
}

/**
 * Reset all categories back to default seed data (dev utility).
 */
export function resetToDefaultCategories(): Category[] {
  persistCategories(initialSeedCategories);
  return initialSeedCategories;
}
