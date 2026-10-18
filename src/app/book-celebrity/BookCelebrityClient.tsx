"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react";
import { CelebrityFilters } from "@/components/celebrity/CelebrityFilters";
import { CelebrityGrid } from "@/components/celebrity/CelebrityGrid";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { useCelebrities } from "@/hooks/useCelebrities";
import { Celebrity } from "@/types";

export function BookCelebrityClient() {
  const searchParams = useSearchParams();
  const { activeCelebrities } = useCelebrities();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "all");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [selectedEventType, setSelectedEventType] = useState(searchParams.get("eventType") || "all");
  const [sortBy, setSortBy] = useState<"featured" | "az" | "za" | "experience">("featured");
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync when query params change
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    const sub = searchParams.get("subcategory");
    const loc = searchParams.get("location");
    const ev = searchParams.get("eventType");

    if (q !== null) setSearchQuery(q);
    if (cat !== null) setSelectedCategory(cat);
    if (sub !== null) setSelectedSubcategory(sub);
    if (loc !== null) setSelectedLocation(loc);
    if (ev !== null) setSelectedEventType(ev);
  }, [searchParams]);

  // Reset subcategory if category changes to "all"
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory("all");
    setVisibleCount(12);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedLocation("all");
    setSelectedEventType("all");
    setSortBy("featured");
    setVisibleCount(12);
  };

  // Filtered and sorted list
  const filteredCelebrities = useMemo(() => {
    let list: Celebrity[] = [...activeCelebrities];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.subcategory.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter((c) => c.categorySlug.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedSubcategory !== "all") {
      list = list.filter((c) => c.subcategorySlug.toLowerCase() === selectedSubcategory.toLowerCase());
    }

    if (selectedLocation !== "all") {
      list = list.filter((c) => c.location.toLowerCase() === selectedLocation.toLowerCase());
    }

    if (selectedEventType !== "all") {
      const targetEvent = selectedEventType.toLowerCase();
      list = list.filter((c) =>
        c.eventTypes.some((e) => e.toLowerCase().includes(targetEvent) || targetEvent.includes(e.toLowerCase()))
      );
    }

    if (sortBy === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "experience") {
      list.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else {
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return list;
  }, [searchQuery, selectedCategory, selectedSubcategory, selectedLocation, selectedEventType, sortBy]);

  const visibleCelebrities = filteredCelebrities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCelebrities.length;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-20">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Book Celebrity" }]} />

          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-0.5 w-4 bg-[#9B111E]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
                  Celebrity Catalog
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-serif">
                Book a Celebrity
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Explore our verified celebrity network and find the right personality for your event.
              </p>
            </div>

            {/* Quick Search */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search celebrities..."
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9B111E] focus:border-[#9B111E]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Results Bar & Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#9B111E]" />
              <span>Filters</span>
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-800">
              Showing <span className="text-[#9B111E] font-bold">{filteredCelebrities.length}</span> Celebrities
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "featured" | "az" | "za" | "experience")}
              className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 outline-none focus:border-[#9B111E]"
            >
              <option value="featured">Featured First</option>
              <option value="az">Name: A to Z</option>
              <option value="za">Name: Z to A</option>
              <option value="experience">Experience: High to Low</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <CelebrityFilters
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              selectedLocation={selectedLocation}
              selectedEventType={selectedEventType}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={setSelectedSubcategory}
              onLocationChange={setSelectedLocation}
              onEventTypeChange={setSelectedEventType}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Collapsible */}
          {isMobileFiltersOpen && (
            <div className="lg:hidden mb-6">
              <CelebrityFilters
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                selectedLocation={selectedLocation}
                selectedEventType={selectedEventType}
                onCategoryChange={(c) => {
                  handleCategoryChange(c);
                  setIsMobileFiltersOpen(false);
                }}
                onSubcategoryChange={(s) => {
                  setSelectedSubcategory(s);
                  setIsMobileFiltersOpen(false);
                }}
                onLocationChange={(l) => {
                  setSelectedLocation(l);
                  setIsMobileFiltersOpen(false);
                }}
                onEventTypeChange={(e) => {
                  setSelectedEventType(e);
                  setIsMobileFiltersOpen(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setIsMobileFiltersOpen(false);
                }}
              />
            </div>
          )}

          {/* Celebrity Results Grid */}
          <div className="lg:col-span-3">
            <CelebrityGrid
              celebrities={visibleCelebrities}
              emptyTitle="No Celebrities Found"
              emptyDescription="No artists matched your current filter criteria. Try choosing a different category or clearing filters."
              onResetFilters={handleResetFilters}
            />

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="px-8 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-gray-800 shadow-xs hover:border-[#9B111E] hover:text-[#9B111E] transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Load More Celebrities ({filteredCelebrities.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
