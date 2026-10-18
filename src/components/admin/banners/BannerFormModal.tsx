"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Sparkles,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { HeroBanner, CreateBannerInput } from "@/types/banner";
import { BannerImageUploadField } from "./BannerImageUploadField";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bannerData: CreateBannerInput) => Promise<boolean> | boolean;
  initialBanner?: HeroBanner | null;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBanner,
}) => {
  const isEditing = !!initialBanner;

  // Form State
  const [title, setTitle] = useState("");
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");

  const [primaryCtaEnabled, setPrimaryCtaEnabled] = useState(true);
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState("Book a Celebrity");
  const [primaryCtaHref, setPrimaryCtaHref] = useState("/book-celebrity");

  const [secondaryCtaEnabled, setSecondaryCtaEnabled] = useState(true);
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState("Explore Categories");
  const [secondaryCtaHref, setSecondaryCtaHref] = useState("#categories-section");

  const [textPosition, setTextPosition] = useState<"left" | "center" | "right">("left");
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [overlayIntensity, setOverlayIntensity] = useState(75);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form on open/edit
  useEffect(() => {
    if (initialBanner) {
      setTitle(initialBanner.title || "");
      setDesktopImage(initialBanner.desktopImage || "");
      setMobileImage(initialBanner.mobileImage || "");
      setHeading(initialBanner.heading || "");
      setDescription(initialBanner.description || "");

      setPrimaryCtaEnabled(initialBanner.primaryCta?.enabled ?? true);
      setPrimaryCtaLabel(initialBanner.primaryCta?.label || "Book a Celebrity");
      setPrimaryCtaHref(initialBanner.primaryCta?.href || "/book-celebrity");

      setSecondaryCtaEnabled(initialBanner.secondaryCta?.enabled ?? true);
      setSecondaryCtaLabel(initialBanner.secondaryCta?.label || "Explore Categories");
      setSecondaryCtaHref(initialBanner.secondaryCta?.href || "#categories-section");

      setTextPosition(initialBanner.textPosition || "left");
      setOverlayEnabled(initialBanner.overlayEnabled ?? true);
      setOverlayIntensity(initialBanner.overlayIntensity ?? 75);
      setDisplayOrder(initialBanner.displayOrder || 1);
      setStatus(initialBanner.status || "active");
    } else {
      // Defaults for new banner
      setTitle("");
      setDesktopImage("");
      setMobileImage("");
      setHeading("Book Your Favorite Celebrity");
      setDescription(
        "Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons."
      );
      setPrimaryCtaEnabled(true);
      setPrimaryCtaLabel("Book a Celebrity");
      setPrimaryCtaHref("/book-celebrity");
      setSecondaryCtaEnabled(true);
      setSecondaryCtaLabel("Explore Categories");
      setSecondaryCtaHref("#categories-section");
      setTextPosition("left");
      setOverlayEnabled(true);
      setOverlayIntensity(75);
      setDisplayOrder(1);
      setStatus("active");
    }
    setErrors({});
  }, [initialBanner, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = "Banner reference title is required.";
    }
    if (!desktopImage.trim()) {
      errs.desktopImage = "Desktop banner image is required.";
    }
    if (primaryCtaEnabled) {
      if (!primaryCtaLabel.trim()) errs.primaryCtaLabel = "Primary button label is required.";
      if (!primaryCtaHref.trim()) errs.primaryCtaHref = "Primary button link is required.";
    }
    if (secondaryCtaEnabled) {
      if (!secondaryCtaLabel.trim()) errs.secondaryCtaLabel = "Secondary button label is required.";
      if (!secondaryCtaHref.trim()) errs.secondaryCtaHref = "Secondary button link is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const bannerData: CreateBannerInput = {
        title: title.trim(),
        desktopImage: desktopImage.trim(),
        mobileImage: mobileImage.trim() || undefined,
        heading: heading.trim() || undefined,
        description: description.trim() || undefined,
        primaryCta: {
          enabled: primaryCtaEnabled,
          label: primaryCtaLabel.trim(),
          href: primaryCtaHref.trim(),
        },
        secondaryCta: {
          enabled: secondaryCtaEnabled,
          label: secondaryCtaLabel.trim(),
          href: secondaryCtaHref.trim(),
        },
        textPosition,
        overlayEnabled,
        overlayIntensity: Number(overlayIntensity),
        displayOrder: Number(displayOrder) || 1,
        status,
      };

      const success = await onSave(bannerData);
      if (success) {
        onClose();
      }
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : "Failed to save banner." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#9B111E] flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 font-serif">
                {isEditing ? "Edit Hero Banner" : "Add New Hero Banner"}
              </h2>
              <p className="text-xs text-gray-500 font-light">
                Configure promotional visual, messaging, and CTA buttons
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errors.form && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Basic Identity & Position */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Banner Identity & Status</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Banner Title */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-800">
                  Banner Reference Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Celebrity Booking Main Gala Banner"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#9B111E] outline-none ${
                    errors.title ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                <p className="text-[11px] text-gray-400">
                  Internal administrative label shown in the banners table.
                </p>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-800">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
                <p className="text-[11px] text-gray-400">Only active banners appear on the homepage.</p>
              </div>

              {/* Display Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-800">Display Order</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
                />
                <p className="text-[11px] text-gray-400">Position in carousel (1 = First slide).</p>
              </div>

              {/* Text Position */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-800">Text Content Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTextPosition("left")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      textPosition === "left"
                        ? "bg-[#9B111E] text-white border-[#9B111E] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextPosition("center")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      textPosition === "center"
                        ? "bg-[#9B111E] text-white border-[#9B111E] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>Center</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextPosition("right")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      textPosition === "right"
                        ? "bg-[#9B111E] text-white border-[#9B111E] shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>Right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Banner Visual Assets */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#9B111E]" />
              <span>Banner Images (Desktop & Mobile)</span>
            </h3>

            {/* Desktop Banner Image */}
            <div className="space-y-1">
              <BannerImageUploadField
                label="Desktop Banner Image *"
                description="High-resolution widescreen photo. Used on desktops, laptops and tablets."
                recommendedSize="1920x800 or 16:9 ratio"
                value={desktopImage}
                onChange={(url) => setDesktopImage(url)}
                isMobile={false}
              />
              {errors.desktopImage && (
                <p className="text-xs text-red-600 font-medium">{errors.desktopImage}</p>
              )}
            </div>

            {/* Mobile Banner Image */}
            <div className="pt-2 border-t border-gray-100">
              <BannerImageUploadField
                label="Mobile Banner Image (Optional)"
                description="Optimized vertical/compact banner for mobile screens. If left empty, desktop image is used."
                recommendedSize="800x800 or 4:3 / 16:9 ratio"
                value={mobileImage}
                onChange={(url) => setMobileImage(url)}
                isMobile={true}
              />
            </div>

            {/* Overlay Settings */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-gray-800 block">
                    Cinematic Dark Overlay
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Darkens background image to ensure text and search bar are perfectly legible.
                  </p>
                </div>

                <div
                  onClick={() => setOverlayEnabled(!overlayEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${
                    overlayEnabled ? "bg-[#9B111E]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      overlayEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {overlayEnabled && (
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <span className="text-xs font-medium text-gray-600 shrink-0">
                    Overlay Intensity:
                  </span>
                  <input
                    type="range"
                    min="30"
                    max="95"
                    step="5"
                    value={overlayIntensity}
                    onChange={(e) => setOverlayIntensity(parseInt(e.target.value))}
                    className="flex-1 accent-[#9B111E] cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-gray-800 w-12 text-right">
                    {overlayIntensity}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Foreground Messaging */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Overlay Headline & Copy
            </h3>

            {/* Banner Heading */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800">
                Banner Heading (Optional)
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Book Your Favorite Celebrity"
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
              />
              <p className="text-[11px] text-gray-400">
                Displays as the main title on this banner slide.
              </p>
            </div>

            {/* Banner Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800">
                Banner Supporting Text (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief promotional copy or artist highlight..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:border-[#9B111E] outline-none"
              />
            </div>
          </div>

          {/* Section 4: Call-To-Action Buttons */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Call-To-Action (CTA) Buttons
            </h3>

            {/* Primary CTA */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Primary Button (Solid Burgundy)
                </span>
                <div
                  onClick={() => setPrimaryCtaEnabled(!primaryCtaEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${
                    primaryCtaEnabled ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      primaryCtaEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {primaryCtaEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={primaryCtaLabel}
                      onChange={(e) => setPrimaryCtaLabel(e.target.value)}
                      placeholder="Book a Celebrity"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
                    />
                    {errors.primaryCtaLabel && (
                      <p className="text-[10px] text-red-600">{errors.primaryCtaLabel}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Button URL / Route
                    </label>
                    <input
                      type="text"
                      value={primaryCtaHref}
                      onChange={(e) => setPrimaryCtaHref(e.target.value)}
                      placeholder="/book-celebrity"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
                    />
                    {errors.primaryCtaHref && (
                      <p className="text-[10px] text-red-600">{errors.primaryCtaHref}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Secondary CTA */}
            <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Secondary Button (Translucent Glass)
                </span>
                <div
                  onClick={() => setSecondaryCtaEnabled(!secondaryCtaEnabled)}
                  className={`w-9 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${
                    secondaryCtaEnabled ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      secondaryCtaEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {secondaryCtaEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={secondaryCtaLabel}
                      onChange={(e) => setSecondaryCtaLabel(e.target.value)}
                      placeholder="Explore Categories"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
                    />
                    {errors.secondaryCtaLabel && (
                      <p className="text-[10px] text-red-600">{errors.secondaryCtaLabel}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Button URL / Route
                    </label>
                    <input
                      type="text"
                      value={secondaryCtaHref}
                      onChange={(e) => setSecondaryCtaHref(e.target.value)}
                      placeholder="#categories-section"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
                    />
                    {errors.secondaryCtaHref && (
                      <p className="text-[10px] text-red-600">{errors.secondaryCtaHref}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-md shadow-red-950/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Banner...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? "Save Changes" : "Save Banner"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
