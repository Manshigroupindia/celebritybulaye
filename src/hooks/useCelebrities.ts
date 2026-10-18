"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Celebrity } from "@/types";
import {
  defaultNormalizedCelebrities,
  getCelebritiesSync,
  createCelebrity as serviceCreateCelebrity,
  updateCelebrity as serviceUpdateCelebrity,
  deleteCelebrity as serviceDeleteCelebrity,
  toggleCelebrityStatus as serviceToggleCelebrityStatus,
  resetToDefaultCelebrities as serviceResetToDefaultCelebrities,
  subscribeCelebritiesFromFirestore,
  CELEBRITIES_UPDATED_EVENT,
  CreateCelebrityInput,
} from "@/services/celebrityService";

export function useCelebrities() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>(defaultNormalizedCelebrities);
  const [isMounted, setIsMounted] = useState(false);

  const refresh = useCallback(() => {
    const list = getCelebritiesSync(undefined, { includeInactive: true });
    setCelebrities(list);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    refresh();

    // 1. Subscribe to Firestore live updates
    const unsubscribeFirestore = subscribeCelebritiesFromFirestore((firestoreCelebrities) => {
      if (firestoreCelebrities && firestoreCelebrities.length > 0) {
        setCelebrities(firestoreCelebrities);
      }
    });

    // 2. Custom event & storage updates
    const handleCustomUpdate = () => {
      refresh();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === "cb_celebrities_store_v1") {
        refresh();
      }
    };

    window.addEventListener(CELEBRITIES_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener(CELEBRITIES_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refresh]);

  const activeCelebrities = useMemo(() => {
    if (!isMounted) {
      return defaultNormalizedCelebrities.filter((c) => (c.status ?? "active") === "active");
    }
    return celebrities.filter((c) => (c.status ?? "active") === "active");
  }, [celebrities, isMounted]);

  const locations = useMemo(() => {
    const list = !isMounted
      ? defaultNormalizedCelebrities.filter((c) => (c.status ?? "active") === "active")
      : activeCelebrities;
    const locs = Array.from(
      new Set(list.map((c) => c.livingLocation || c.location).filter(Boolean))
    );
    return locs.sort();
  }, [activeCelebrities, isMounted]);

  const createCelebrity = useCallback(
    async (data: CreateCelebrityInput) => {
      const result = await serviceCreateCelebrity(data);
      refresh();
      return result;
    },
    [refresh]
  );

  const updateCelebrity = useCallback(
    async (id: string, updates: Partial<Celebrity>) => {
      const result = await serviceUpdateCelebrity(id, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteCelebrity = useCallback(
    async (id: string) => {
      const result = await serviceDeleteCelebrity(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const toggleCelebrityStatus = useCallback(
    async (id: string) => {
      const result = await serviceToggleCelebrityStatus(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const resetToDefault = useCallback(() => {
    const result = serviceResetToDefaultCelebrities();
    refresh();
    return result;
  }, [refresh]);

  const getCelebrityBySlug = useCallback(
    (slug: string, options?: { includeInactive?: boolean }) => {
      const targetList = options?.includeInactive ? celebrities : activeCelebrities;
      return targetList.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
    },
    [celebrities, activeCelebrities]
  );

  const getCelebrityById = useCallback(
    (id: string) => {
      return celebrities.find((c) => c.id === id) || null;
    },
    [celebrities]
  );

  return {
    celebrities,
    activeCelebrities,
    locations,
    isMounted,
    refresh,
    createCelebrity,
    updateCelebrity,
    deleteCelebrity,
    toggleCelebrityStatus,
    resetToDefault,
    getCelebrityBySlug,
    getCelebrityById,
  };
}
