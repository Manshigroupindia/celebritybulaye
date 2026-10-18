"use client";

import { useState, useEffect, useCallback } from "react";
import { HeroBanner, CreateBannerInput, UpdateBannerInput } from "@/types/banner";
import { initialBanners } from "@/data/initialBanners";
import {
  getBanners,
  createBanner as serviceCreateBanner,
  updateBanner as serviceUpdateBanner,
  deleteBanner as serviceDeleteBanner,
  toggleBannerStatus as serviceToggleStatus,
  reorderBanners as serviceReorderBanners,
  resetBannersToDefault as serviceResetBanners,
  subscribeBannersFromFirestore,
  BANNERS_STORAGE_KEY,
  BANNERS_UPDATED_EVENT,
} from "@/services/bannerService";

export function useBanners() {
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const [isMounted, setIsMounted] = useState(false);

  const refresh = useCallback(() => {
    const latest = getBanners();
    setBanners(latest);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    refresh();

    // 1. Subscribe to Firestore live updates
    const unsubscribeFirestore = subscribeBannersFromFirestore((firestoreBanners) => {
      if (firestoreBanners && firestoreBanners.length > 0) {
        setBanners(firestoreBanners);
      }
    });

    // 2. Custom & local storage fallback
    const handleCustomUpdate = () => {
      refresh();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === BANNERS_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(BANNERS_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener(BANNERS_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refresh]);

  const activeBanners = banners.filter((b) => b.status === "active");

  const createBanner = useCallback(
    async (input: CreateBannerInput) => {
      const result = await serviceCreateBanner(input);
      refresh();
      return result;
    },
    [refresh]
  );

  const updateBanner = useCallback(
    async (id: string, updates: UpdateBannerInput) => {
      const result = await serviceUpdateBanner(id, updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const deleteBanner = useCallback(
    async (id: string) => {
      const result = await serviceDeleteBanner(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const toggleBannerStatus = useCallback(
    async (id: string) => {
      const result = await serviceToggleStatus(id);
      refresh();
      return result;
    },
    [refresh]
  );

  const reorderBanners = useCallback(
    async (orderedIds: string[]) => {
      const result = await serviceReorderBanners(orderedIds);
      refresh();
      return result;
    },
    [refresh]
  );

  const resetBanners = useCallback(() => {
    const result = serviceResetBanners();
    refresh();
    return result;
  }, [refresh]);

  return {
    banners,
    activeBanners,
    isMounted,
    refresh,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,
    resetBanners,
  };
}
