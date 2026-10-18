"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { eventTypes } from "@/data/eventTypes";
import { useCelebrities } from "@/hooks/useCelebrities";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useBanners } from "@/hooks/useBanners";

export const Hero: React.FC = () => {
  const router = useRouter();
  const { activeCategories } = useCategories();
  const { locations } = useCelebrities();
  const { settings } = useSiteSettings();
  const heroFallback = settings.homepage.hero;

  const { activeBanners, isMounted } = useBanners();

  // Search Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const hasBanners = activeBanners.length > 0;
  const isCarousel = activeBanners.length > 1;

  // Ensure currentSlide is within bounds
  useEffect(() => {
    if (currentSlide >= activeBanners.length && activeBanners.length > 0) {
      setCurrentSlide(0);
    }
  }, [activeBanners.length, currentSlide]);

  // Next / Previous slide handlers
  const nextSlide = useCallback(() => {
    if (!isCarousel) return;
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  }, [isCarousel, activeBanners.length]);

  const prevSlide = useCallback(() => {
    if (!isCarousel) return;
    setCurrentSlide((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  }, [isCarousel, activeBanners.length]);

  // Autoplay rotation every 5.5s (pauses on hover and if prefers-reduced-motion)
  useEffect(() => {
    if (!isCarousel || isPaused) return;

    // Check prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [isCarousel, isPaused, nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !isCarousel) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  // Active slide banner data
  const currentBanner = hasBanners ? activeBanners[currentSlide] || activeBanners[0] : null;

  // Heading text parsing with gold gradient on last word
  const rawHeading =
    currentBanner?.heading || heroFallback.heading || "Book Your Favorite Celebrity";
  const words = rawHeading.trim().split(" ");
  const lastWord = words.length > 1 ? words.pop() : "";
  const firstWords = words.join(" ");

  // Supporting description
  const descriptionText =
    currentBanner?.description ||
    heroFallback.supportingText ||
    "Connect directly with verified Bollywood stars, playback singers, stand-up comedians, top influencers, and sports icons for weddings, corporate galas, concerts, brand collaborations, and private celebrations.";

  // CTAs
  const primaryCta = currentBanner?.primaryCta?.enabled
    ? {
        label: currentBanner.primaryCta.label || "Book a Celebrity",
        href: currentBanner.primaryCta.href || "/book-celebrity",
      }
    : hasBanners && currentBanner?.primaryCta && !currentBanner.primaryCta.enabled
    ? null
    : {
        label: heroFallback.primaryButtonText || "Book a Celebrity",
        href: heroFallback.primaryButtonLink || "/book-celebrity",
      };

  const secondaryCta = currentBanner?.secondaryCta?.enabled
    ? {
        label: currentBanner.secondaryCta.label || "Explore Categories",
        href: currentBanner.secondaryCta.href || "#categories-section",
      }
    : hasBanners && currentBanner?.secondaryCta && !currentBanner.secondaryCta.enabled
    ? null
    : {
        label: heroFallback.secondaryButtonText || "Explore Categories",
        href: heroFallback.secondaryButtonLink || "#categories-section",
      };

  const alignmentClass =
    currentBanner?.textPosition === "center"
      ? "text-center items-center mx-auto"
      : currentBanner?.textPosition === "right"
      ? "text-right items-end ml-auto"
      : "text-left items-start mr-auto";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedEventType) params.set("eventType", selectedEventType);
    if (selectedLocation) params.set("location", selectedLocation);

    router.push(`/book-celebrity?${params.toString()}`);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-black text-white pt-12 pb-20 lg:pt-16 lg:pb-28"
    >
      {/* Background Images Layer */}
      <div className="absolute inset-0 z-0">
        {hasBanners ? (
          activeBanners.map((banner, index) => {
            const isCurrent = index === currentSlide;
            const overlayIntensity = banner.overlayEnabled
              ? (banner.overlayIntensity ?? 70) / 100
              : 0;

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isCurrent ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {banner.mobileImage ? (
                  <>
                    {/* Separate Mobile Image (< sm) */}
                    <div className="relative w-full h-full block sm:hidden">
                      <Image
                        src={banner.mobileImage}
                        alt={banner.title}
                        fill
                        priority={index === 0}
                        className="object-cover object-center"
                        sizes="100vw"
                        unoptimized
                      />
                    </div>
                    {/* Desktop Image (>= sm) */}
                    <div className="relative w-full h-full hidden sm:block">
                      <Image
                        src={banner.desktopImage}
                        alt={banner.title}
                        fill
                        priority={index === 0}
                        className="object-cover object-center"
                        sizes="100vw"
                        unoptimized
                      />
                    </div>
                  </>
                ) : (
                  <Image
                    src={banner.desktopImage}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                    unoptimized
                  />
                )}

                {/* Dynamic Banner Overlay */}
                {banner.overlayEnabled && (
                  <div
                    className="absolute inset-0 bg-black transition-opacity duration-500"
                    style={{ opacity: overlayIntensity }}
                  />
                )}
              </div>
            );
          })
        ) : (
          /* Fallback Single Hero Image when 0 banners configured */
          <Image
            src={
              heroFallback.backgroundImage ||
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85"
            }
            alt="Celebrity Booking Gala Event"
            fill
            priority
            className="object-cover object-center opacity-35 scale-102"
            sizes="100vw"
          />
        )}

        {/* Global Cinematic Vignette Overlays for seamless blending */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/50 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* Main Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl flex flex-col transition-all duration-300 ${alignmentClass}`}>
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#FFE5A3] tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{heroFallback.eyebrow || "Premium Celebrity Booking Platform"}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif text-white leading-tight mb-4 animate-in fade-in slide-in-from-bottom-3 duration-400 drop-shadow-md">
            {firstWords}
            {lastWord ? " " : ""}
            {lastWord && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5D77F] via-[#D4AF37] to-[#C5A059]">
                {lastWord}
              </span>
            )}
          </h1>

          {/* Subtitle / Description */}
          <p className="text-sm sm:text-lg text-gray-200 leading-relaxed max-w-2xl mb-8 font-light animate-in fade-in slide-in-from-bottom-4 duration-500 drop-shadow-sm">
            {descriptionText}
          </p>

          {/* CTA Buttons */}
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-wrap items-center gap-4 mb-8 sm:mb-10">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-sm font-bold rounded-lg shadow-xl shadow-red-950/50 hover:shadow-red-900/60 transition-all transform hover:-translate-y-0.5"
                >
                  <span>{primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg backdrop-blur-md border border-white/20 transition-all"
                >
                  <span>{secondaryCta.label}</span>
                </a>
              )}
            </div>
          )}

          {/* Carousel Pagination Dots */}
          {isCarousel && (
            <div className="flex items-center gap-2 mb-8 animate-in fade-in">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Switch to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "w-8 bg-[#C5A059] shadow-sm shadow-[#C5A059]/50"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Search Bar */}
        <div className="w-full bg-white rounded-2xl shadow-2xl p-3 sm:p-4 border border-gray-100 text-gray-900 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-3 items-center"
          >
            {/* Search Input */}
            <div className="md:col-span-2 lg:col-span-4 relative">
              <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#9B111E] focus-within:bg-white transition-colors">
                <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search celebrities, artists, influencers..."
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="md:col-span-1 lg:col-span-2 relative">
              <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#9B111E] focus-within:bg-white transition-colors">
                <Layers className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {activeCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Type Dropdown */}
            <div className="md:col-span-1 lg:col-span-3 relative">
              <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#9B111E] focus-within:bg-white transition-colors">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                >
                  <option value="">All Event Types</option>
                  {eventTypes.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="md:col-span-2 lg:col-span-2 relative">
              <div className="flex items-center px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#9B111E] focus-within:bg-white transition-colors">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent border-none outline-none text-gray-700 cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Submit Button */}
            <div className="md:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full h-11 bg-[#9B111E] hover:bg-[#740D16] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
