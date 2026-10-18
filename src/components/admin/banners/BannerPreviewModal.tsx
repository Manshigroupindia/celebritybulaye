"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Monitor, Smartphone, Sparkles, ArrowRight } from "lucide-react";
import { HeroBanner } from "@/types/banner";

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: HeroBanner | null;
}

export const BannerPreviewModal: React.FC<BannerPreviewModalProps> = ({
  isOpen,
  onClose,
  banner,
}) => {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");

  if (!isOpen || !banner) return null;

  // Heading parsing for gold gradient highlight
  const rawHeading = banner.heading || "";
  const words = rawHeading.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  const imageToUse =
    deviceView === "mobile" && banner.mobileImage
      ? banner.mobileImage
      : banner.desktopImage;

  const overlayOpacity = banner.overlayEnabled
    ? (banner.overlayIntensity ?? 70) / 100
    : 0;

  const alignmentClass =
    banner.textPosition === "center"
      ? "text-center items-center mx-auto"
      : banner.textPosition === "right"
      ? "text-right items-end ml-auto"
      : "text-left items-start mr-auto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden my-6 flex flex-col">
        {/* Preview Top Bar */}
        <div className="px-6 py-4 bg-black/60 border-b border-neutral-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFE5A3] bg-red-950/80 px-2.5 py-1 rounded border border-red-800/60">
              Live Hero Simulation
            </span>
            <span className="text-sm font-semibold text-neutral-300 truncate max-w-xs sm:max-w-md">
              {banner.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="bg-neutral-800 p-1 rounded-xl flex items-center gap-1 border border-neutral-700">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  deviceView === "desktop"
                    ? "bg-[#9B111E] text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  deviceView === "mobile"
                    ? "bg-[#9B111E] text-white shadow-xs"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="p-4 sm:p-8 bg-black/40 flex items-center justify-center overflow-hidden">
          <div
            className={`transition-all duration-300 relative rounded-2xl overflow-hidden border border-neutral-700/80 shadow-2xl bg-black ${
              deviceView === "mobile"
                ? "w-[360px] min-h-[580px]"
                : "w-full min-h-[460px] sm:min-h-[520px]"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={imageToUse}
                alt={banner.title}
                fill
                sizes={deviceView === "mobile" ? "360px" : "100vw"}
                className="object-cover object-center"
                unoptimized
              />

              {/* Dynamic Overlay */}
              {banner.overlayEnabled && (
                <div
                  className="absolute inset-0 bg-black transition-opacity duration-300"
                  style={{ opacity: overlayOpacity }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Simulated Hero Foreground Content */}
            <div className="relative z-10 p-6 sm:p-12 flex flex-col justify-center min-h-[460px] sm:min-h-[520px]">
              <div className={`max-w-2xl flex flex-col ${alignmentClass}`}>
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-semibold text-[#FFE5A3] tracking-widest uppercase mb-4 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Celebrity Bulaye Banner</span>
                </div>

                {/* Heading */}
                {rawHeading && (
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-serif text-white leading-tight mb-4 drop-shadow-md">
                    {firstWords}
                    {lastWord ? " " : ""}
                    {lastWord && (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#C5A059]">
                        {lastWord}
                      </span>
                    )}
                  </h1>
                )}

                {/* Description */}
                {banner.description && (
                  <p className="text-xs sm:text-base text-neutral-200 leading-relaxed mb-8 font-light drop-shadow-sm max-w-xl">
                    {banner.description}
                  </p>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  {banner.primaryCta?.enabled && banner.primaryCta.label && (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#9B111E] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-red-950/60 pointer-events-none">
                      <span>{banner.primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}

                  {banner.secondaryCta?.enabled && banner.secondaryCta.label && (
                    <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md border border-white/20 pointer-events-none">
                      <span>{banner.secondaryCta.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Search Bar Placeholder */}
              <div className="mt-8 pt-4 border-t border-white/10">
                <div className="w-full bg-white/90 backdrop-blur-md rounded-xl p-2.5 text-xs text-neutral-500 flex items-center justify-between">
                  <span>Search celebrities, playback singers, stand-up comedians...</span>
                  <span className="px-3 py-1 bg-[#9B111E] text-white font-bold rounded-lg text-[10px]">
                    Search
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Footer Info */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-4">
            <span>
              Display Order: <strong className="text-white">#{banner.displayOrder}</strong>
            </span>
            <span>
              Alignment: <strong className="text-white capitalize">{banner.textPosition}</strong>
            </span>
            <span>
              Status:{" "}
              <strong
                className={banner.status === "active" ? "text-emerald-400" : "text-amber-400"}
              >
                {banner.status.toUpperCase()}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
