"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Category, SubCategory } from "@/types";
import {
  getCategories,
  getActiveCategories,
  createCategory as serviceCreateCategory,
  updateCategory as serviceUpdateCategory,
  deleteCategory as serviceDeleteCategory,
  toggleCategoryStatus as serviceToggleCategoryStatus,
  createSubcategory as serviceCreateSubcategory,
  updateSubcategory as serviceUpdateSubcategory,
  deleteSubcategory as serviceDeleteSubcategory,
  toggleSubcategoryStatus as serviceToggleSubcategoryStatus,
  resetToDefaultCategories as serviceResetToDefaultCategories,
  subscribeCategoriesFromFirestore,
  CATEGORIES_UPDATED_EVENT,
} from "@/services/categoryService";
import { categories as defaultCategories } from "@/data/categories";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isMounted, setIsMounted] = useState(false);

  const refresh = useCallback(() => {
    const list = getCategories({ includeInactive: true });
    setCategories(list);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    refresh();

    // 1. Subscribe to Firestore live updates
    const unsubscribeFirestore = subscribeCategoriesFromFirestore((firestoreCategories) => {
      if (firestoreCategories && firestoreCategories.length > 0) {
        setCategories(firestoreCategories);
      }
    });

    // 2. Custom & local storage event fallback
    const handleCustomUpdate = () => {
      refresh();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === "cb_categories_store_v1") {
        refresh();
      }
    };

    window.addEventListener(CATEGORIES_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refresh]);

  const activeCategories = useMemo(() => {
    // If not mounted yet (SSR phase), use default active categories to prevent layout shift
    if (!isMounted) {
      return defaultCategories.filter((c) => (c.status ?? "active") === "active");
    }
    return getActiveCategories();
  }, [categories, isMounted]);

  const createCategory = useCallback(
    async (data: Parameters<typeof serviceCreateCategory>[0]) => {
      const result = await serviceCreateCategory(data);
      refresh();
      return result;
    },
    [refresh]
  );

  const updateCategory = useCallback(
    async (id: string, updates: Parameters<typeof serviceUpdateCategory>[1]) => {
      const result = await serviceUpdateCategory(id, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const result = await serviceDeleteCategory(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const toggleCategoryStatus = useCallback(
    async (id: string) => {
      const result = await serviceToggleCategoryStatus(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const createSubcategory = useCallback(
    async (parentCategoryId: string, data: Parameters<typeof serviceCreateSubcategory>[1]) => {
      const result = await serviceCreateSubcategory(parentCategoryId, data);
      refresh();
      return result;
    },
    [refresh]
  );

  const updateSubcategory = useCallback(
    async (
      parentCategoryId: string,
      subcategoryIdOrSlug: string,
      updates: Parameters<typeof serviceUpdateSubcategory>[2]
    ) => {
      const result = await serviceUpdateSubcategory(parentCategoryId, subcategoryIdOrSlug, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteSubcategory = useCallback(
    async (parentCategoryId: string, subcategoryIdOrSlug: string) => {
      const result = await serviceDeleteSubcategory(parentCategoryId, subcategoryIdOrSlug);
      refresh();
      return result;
    },
    [refresh]
  );

  const toggleSubcategoryStatus = useCallback(
    async (parentCategoryId: string, subcategoryIdOrSlug: string) => {
      const result = await serviceToggleSubcategoryStatus(parentCategoryId, subcategoryIdOrSlug);
      refresh();
      return result;
    },
    [refresh]
  );

  const resetToDefault = useCallback(() => {
    const result = serviceResetToDefaultCategories();
    refresh();
    return result;
  }, [refresh]);

  const getCategoryBySlug = useCallback(
    (slug: string, options?: { includeInactive?: boolean }) => {
      const targetList = options?.includeInactive ? categories : activeCategories;
      return targetList.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
    },
    [categories, activeCategories]
  );

  return {
    categories,
    activeCategories,
    isMounted,
    refresh,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
    resetToDefault,
  };
}
