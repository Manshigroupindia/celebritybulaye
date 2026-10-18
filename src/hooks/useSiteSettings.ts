"use client";

import { useState, useEffect, useCallback } from "react";
import { AllSiteSettings } from "@/types/settings";
import { defaultSiteSettings } from "@/data/defaultSiteSettings";
import {
  getSiteSettingsSync,
  updateSiteSettings as serviceUpdateSiteSettings,
  resetSiteSettingsToDefault as serviceResetSiteSettings,
  subscribeSiteSettingsFromFirestore,
  SITE_SETTINGS_UPDATED_EVENT,
  SITE_SETTINGS_STORAGE_KEY,
} from "@/services/siteSettingsService";

export function useSiteSettings() {
  const [settings, setSettings] = useState<AllSiteSettings>(defaultSiteSettings);
  const [isMounted, setIsMounted] = useState(false);

  const refresh = useCallback(() => {
    const latest = getSiteSettingsSync();
    setSettings(latest);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    refresh();

    // 1. Subscribe to Firestore live updates
    const unsubscribeFirestore = subscribeSiteSettingsFromFirestore((firestoreSettings) => {
      if (firestoreSettings) {
        setSettings(firestoreSettings);
      }
    });

    // 2. Custom & local storage updates
    const handleCustomUpdate = () => {
      refresh();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === SITE_SETTINGS_STORAGE_KEY) {
        refresh();
      }
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [refresh]);

  const updateSettings = useCallback(
    async (updates: Partial<AllSiteSettings>) => {
      const result = await serviceUpdateSiteSettings(updates);
      refresh();
      return result;
    },
    [refresh]
  );

  const resetSettings = useCallback(async () => {
    const result = await serviceResetSiteSettings();
    refresh();
    return result;
  }, [refresh]);

  return {
    settings,
    isMounted,
    refresh,
    updateSettings,
    resetSettings,
  };
}
