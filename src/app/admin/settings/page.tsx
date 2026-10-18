"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Palette,
  Phone,
  Share2,
  Home,
  LayoutTemplate,
  Languages,
  Search,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { AllSiteSettings } from "@/types/settings";
import { GeneralTab } from "@/components/admin/settings/GeneralTab";
import { BrandingTab } from "@/components/admin/settings/BrandingTab";
import { ContactTab } from "@/components/admin/settings/ContactTab";
import { SocialTab } from "@/components/admin/settings/SocialTab";
import { HomepageTab } from "@/components/admin/settings/HomepageTab";
import { FooterTab } from "@/components/admin/settings/FooterTab";
import { VisitorCounterTab } from "@/components/admin/settings/VisitorCounterTab";
import { LocalizationTab } from "@/components/admin/settings/LocalizationTab";
import { SeoTab } from "@/components/admin/settings/SeoTab";

type TabId =
  | "general"
  | "branding"
  | "contact"
  | "social"
  | "homepage"
  | "footer"
  | "visitorCounter"
  | "localization"
  | "seo";

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "general",
    label: "General",
    icon: Globe,
    description: "Site identity, URL, country & status",
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
    description: "Logos, favicon & signature colors",
  },
  {
    id: "contact",
    label: "Contact Information",
    icon: Phone,
    description: "Hotline, WhatsApp, email & address",
  },
  {
    id: "social",
    label: "Social Media",
    icon: Share2,
    description: "Profiles, links & public icons",
  },
  {
    id: "homepage",
    label: "Homepage",
    icon: Home,
    description: "Hero copy, statistics & section toggles",
  },
  {
    id: "footer",
    label: "Footer",
    icon: LayoutTemplate,
    description: "Description, copyright & column visibility",
  },
  {
    id: "visitorCounter",
    label: "Visitor Counter",
    icon: Activity,
    description: "Public footer counter, starting count & live visits",
  },
  {
    id: "localization",
    label: "Language & Localization",
    icon: Languages,
    description: "Language selector & regional options",
  },
  {
    id: "seo",
    label: "SEO & Metadata",
    icon: Search,
    description: "Meta tags, Open Graph & social previews",
  },
];

export default function AdminSettingsPage() {
  const { settings, isMounted, updateSettings, resetSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<TabId>("general");

  // Local working copy of settings in form state
  const [formData, setFormData] = useState<AllSiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Confirmation Modals
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showRestoreDefaultsModal, setShowRestoreDefaultsModal] = useState(false);

  // Sync working state when hook loads saved settings
  useEffect(() => {
    if (isMounted) {
      setFormData(settings);
    }
  }, [isMounted, settings]);

  // Determine if there are unsaved edits
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(settings);
  }, [formData, settings]);

  // Handle Save
  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Validate critical fields
      if (!formData.general.siteName.trim()) {
        throw new Error("Website Name cannot be empty.");
      }

      const result = await updateSettings(formData);
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(result.error || "Failed to save settings.");
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset Unsaved Changes
  const handleResetUnsaved = () => {
    if (isDirty) {
      setShowResetConfirmModal(true);
    }
  };

  const confirmResetUnsaved = () => {
    setFormData(settings);
    setShowResetConfirmModal(false);
    setSaveError(null);
  };

  // Handle Restore Factory Demo Defaults
  const confirmRestoreDefaults = async () => {
    const result = await resetSettings();
    if (result.success && result.settings) {
      setFormData(result.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else if (result.error) {
      setSaveError(result.error);
    }
    setShowRestoreDefaultsModal(false);
  };

  // Helper form updates for sub-tabs
  const updateGeneral = (updates: Partial<AllSiteSettings["general"]>) => {
    setFormData((prev) => ({
      ...prev,
      general: { ...prev.general, ...updates },
    }));
  };

  const updateBranding = (updates: Partial<AllSiteSettings["branding"]>) => {
    setFormData((prev) => ({
      ...prev,
      branding: { ...prev.branding, ...updates },
    }));
  };

  const updateContact = (updates: Partial<AllSiteSettings["contact"]>) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }));
  };

  const updateSocial = (updates: Partial<AllSiteSettings["social"]>) => {
    setFormData((prev) => ({
      ...prev,
      social: { ...prev.social, ...updates },
    }));
  };

  const updateHomepage = (updates: Partial<AllSiteSettings["homepage"]>) => {
    setFormData((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        ...updates,
      },
    }));
  };

  const updateFooter = (updates: Partial<AllSiteSettings["footer"]>) => {
    setFormData((prev) => ({
      ...prev,
      footer: { ...prev.footer, ...updates },
    }));
  };

  const updateVisitorCounter = (
    updates: Partial<AllSiteSettings["visitorCounter"]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      visitorCounter: { ...prev.visitorCounter, ...updates },
    }));
  };

  const updateLocalization = (
    updates: Partial<AllSiteSettings["localization"]>
  ) => {
    setFormData((prev) => ({
      ...prev,
      localization: { ...prev.localization, ...updates },
    }));
  };

  const updateSeo = (updates: Partial<AllSiteSettings["seo"]>) => {
    setFormData((prev) => ({
      ...prev,
      seo: { ...prev.seo, ...updates },
    }));
  };

  const formattedUpdatedAt = useMemo(() => {
    if (!settings.updatedAt) return null;
    try {
      const date = new Date(settings.updatedAt);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [settings.updatedAt]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Sticky Action Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md bg-white/95">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif tracking-tight">
              Site Settings
            </h1>
            {isDirty && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300 animate-pulse">
                Unsaved Edits
              </span>
            )}
            {settings.general.websiteStatus === "maintenance" && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold border border-red-300">
                Maintenance Active
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
            Manage your website identity, contact details, homepage content, social links and SEO settings.
          </p>
          {formattedUpdatedAt && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              Last saved: {formattedUpdatedAt}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Reset Unsaved Button */}
          <button
            type="button"
            onClick={handleResetUnsaved}
            disabled={!isDirty || isSaving}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isDirty
                ? "bg-white text-gray-700 hover:bg-gray-100 border-gray-200 shadow-xs cursor-pointer"
                : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
            }`}
            title="Revert all changes made since last save"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Unsaved</span>
          </button>

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all transform active:scale-98 ${
              saveSuccess
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#9B111E] hover:bg-[#740D16] text-white shadow-red-950/20"
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Published & Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>

          {/* Quick Preview Public Website Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
            title="View Public Homepage in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Feedback Messages */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Settings successfully saved! Public header, footer, homepage, and contact desk have been updated.
            </span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-emerald-900 hover:text-emerald-950 shrink-0"
          >
            View live website ↗
          </a>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#9B111E] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#FFE5A3]" : "text-gray-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Form Body */}
      <div>
        {activeTab === "general" && (
          <GeneralTab data={formData.general} onChange={updateGeneral} />
        )}
        {activeTab === "branding" && (
          <BrandingTab data={formData.branding} onChange={updateBranding} />
        )}
        {activeTab === "contact" && (
          <ContactTab data={formData.contact} onChange={updateContact} />
        )}
        {activeTab === "social" && (
          <SocialTab data={formData.social} onChange={updateSocial} />
        )}
        {activeTab === "homepage" && (
          <HomepageTab data={formData.homepage} onChange={updateHomepage} />
        )}
        {activeTab === "footer" && (
          <FooterTab data={formData.footer} onChange={updateFooter} />
        )}
        {activeTab === "visitorCounter" && (
          <VisitorCounterTab
            data={formData.visitorCounter}
            onChange={updateVisitorCounter}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
        {activeTab === "localization" && (
          <LocalizationTab
            data={formData.localization}
            onChange={updateLocalization}
          />
        )}
        {activeTab === "seo" && (
          <SeoTab data={formData.seo} onChange={updateSeo} />
        )}
      </div>

      {/* Footer Utility Strip */}
      <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Celebrity Bulaye Site Configuration Service</span>
        </div>

        <button
          type="button"
          onClick={() => setShowRestoreDefaultsModal(true)}
          className="text-[11px] text-gray-400 hover:text-red-600 transition-colors underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restore Initial Demo Defaults</span>
        </button>
      </div>

      {/* Modal 1: Reset Unsaved Changes Confirmation */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Discard Unsaved Changes?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              You have unsaved edits in this form. Discarding will revert the form fields back to the currently active website configuration.
              <br /><br />
              <strong className="text-gray-800">Your previously saved site settings will not be erased.</strong>
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={confirmResetUnsaved}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Discard Unsaved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Restore Factory Defaults Confirmation */}
      {showRestoreDefaultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Restore Initial Website Defaults?
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              This will overwrite your saved configuration and restore all 8 modules (branding, hero, stats, contact, social, footer, SEO) back to the original demo defaults.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRestoreDefaultsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRestoreDefaults}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
              >
                Yes, Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
