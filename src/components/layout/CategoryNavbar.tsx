"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Category, SubCategory } from "@/types";

export const CategoryNavbar: React.FC = () => {
  const pathname = usePathname();
  const { activeCategories } = useCategories();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!activeCategories || activeCategories.length === 0) {
    return null;
  }

  const handleMouseEnter = (slug: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(slug);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Find active category for mobile dropdown panel
  const activeCategoryWithSubs = activeCategories.find((cat) => {
    if (cat.slug !== activeDropdown) return false;
    const subs = (cat.subcategories || []).filter(
      (s: SubCategory) => (s.status ?? "active") === "active"
    );
    return subs.length > 0;
  });

  const activeCategorySubs = (activeCategoryWithSubs?.subcategories || []).filter(
    (s: SubCategory) => (s.status ?? "active") === "active"
  );

  return (
    <div
      ref={navRef}
      className="bg-[#9B111E] text-white shadow-md relative z-30 overflow-visible"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-visible">
        {/* Horizontal scroll on mobile, overflow-visible & centered on desktop */}
        <div className="category-strip flex items-center overflow-x-auto md:overflow-visible py-0 text-sm font-medium scrollbar-none whitespace-nowrap justify-start lg:justify-center gap-1 sm:gap-2">
          {activeCategories.map((category: Category, index: number) => {
            const activeSubs = (category.subcategories || []).filter(
              (s: SubCategory) => (s.status ?? "active") === "active"
            );
            const hasSub = activeSubs.length > 0;
            const isCurrentActive =
              pathname === `/category/${category.slug}` ||
              pathname.startsWith(`/category/${category.slug}/`);
            const isMenuOpen = activeDropdown === category.slug;

            // Align dropdown right-aligned for items near the right edge to avoid window overflow
            const isAlignRight = index >= activeCategories.length - 2;

            return (
              <div
                key={category.slug}
                className="relative shrink-0 group/item"
                onMouseEnter={() => hasSub && handleMouseEnter(category.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center">
                  <Link
                    href={`/category/${category.slug}`}
                    className={`pl-3 ${
                      hasSub ? "pr-1" : "pr-3"
                    } py-2.5 sm:py-3 inline-flex items-center text-xs sm:text-[13px] font-medium tracking-wide uppercase transition-colors rounded-none ${
                      isCurrentActive
                        ? "bg-[#740D16] text-[#FFE5A3] font-semibold"
                        : "text-white/90 hover:text-white hover:bg-black/15"
                    }`}
                  >
                    <span>{category.name}</span>
                  </Link>

                  {hasSub && (
                    <button
                      type="button"
                      aria-expanded={isMenuOpen}
                      aria-label={`Toggle ${category.name} subcategories`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveDropdown((prev) =>
                          prev === category.slug ? null : category.slug
                        );
                      }}
                      className={`pr-2.5 pl-1 py-2.5 sm:py-3 inline-flex items-center text-white/80 hover:text-white hover:bg-black/15 transition-colors ${
                        isCurrentActive ? "bg-[#740D16] text-[#FFE5A3]" : ""
                      }`}
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isMenuOpen
                            ? "rotate-180 text-[#FFE5A3]"
                            : "group-hover/item:text-white"
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories Dropdown for Desktop (md and above) */}
                {hasSub && isMenuOpen && (
                  <div
                    className={`hidden md:block absolute ${
                      isAlignRight ? "right-0" : "left-0"
                    } top-full pt-1.5 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-150`}
                    onMouseEnter={() => handleMouseEnter(category.slug)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Invisible hover bridge to prevent mouse-leave flicker */}
                    <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent pointer-events-auto" />

                    <div className="bg-white text-gray-900 rounded-b-xl shadow-2xl border-t-2 border-[#C5A059] py-2 border-x border-b border-gray-100">
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#9B111E] uppercase tracking-wider font-serif">
                          {category.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                          {activeSubs.length} Types
                        </span>
                      </div>

                      <div className="py-1 max-h-80 overflow-y-auto">
                        {activeSubs.map((sub: SubCategory) => (
                          <Link
                            key={sub.slug}
                            href={`/category/${category.slug}/${sub.slug}`}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center justify-between px-4 py-2 text-xs text-gray-700 hover:text-[#9B111E] hover:bg-red-50/70 transition-colors group/sub"
                          >
                            <div className="pr-2">
                              <span className="font-semibold block">{sub.name}</span>
                              {sub.description && (
                                <span className="text-[10px] text-gray-400 line-clamp-1">
                                  {sub.description}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="w-3 h-3 text-gray-300 group-hover/sub:text-[#9B111E] group-hover/sub:translate-x-0.5 transition-all shrink-0" />
                          </Link>
                        ))}
                      </div>

                      <div className="mt-1 pt-1 border-t border-gray-100 px-3 pb-1">
                        <Link
                          href={`/category/${category.slug}`}
                          onClick={() => setActiveDropdown(null)}
                          className="text-[11px] font-semibold text-[#9B111E] hover:text-[#740D16] flex items-center justify-center gap-1 py-1 w-full text-center hover:bg-gray-50 rounded"
                        >
                          Browse all {category.name}s →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subcategories Dropdown Panel for Mobile (under category bar) */}
      {activeCategoryWithSubs && (
        <div className="md:hidden bg-white text-gray-900 border-t-2 border-[#C5A059] shadow-2xl py-3 px-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9B111E]" />
              <span className="text-xs font-bold text-[#9B111E] uppercase tracking-wider font-serif">
                {activeCategoryWithSubs.name} Specializations
              </span>
              <span className="text-[10px] bg-red-50 text-[#9B111E] font-semibold px-2 py-0.5 rounded-full">
                {activeCategorySubs.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveDropdown(null)}
              className="text-gray-400 hover:text-gray-700 text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto py-1">
            {activeCategorySubs.map((sub: SubCategory) => (
              <Link
                key={sub.slug}
                href={`/category/${activeCategoryWithSubs.slug}/${sub.slug}`}
                onClick={() => setActiveDropdown(null)}
                className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-xs font-medium text-gray-800 hover:text-[#9B111E] flex items-center justify-between border border-gray-200/60 transition-colors group/mob"
              >
                <span className="truncate">{sub.name}</span>
                <ArrowRight className="w-3 h-3 text-gray-400 group-hover/mob:text-[#9B111E] shrink-0 ml-1" />
              </Link>
            ))}
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-100 text-center">
            <Link
              href={`/category/${activeCategoryWithSubs.slug}`}
              onClick={() => setActiveDropdown(null)}
              className="text-xs font-bold text-[#9B111E] hover:underline"
            >
              View all {activeCategoryWithSubs.name} celebrities →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
