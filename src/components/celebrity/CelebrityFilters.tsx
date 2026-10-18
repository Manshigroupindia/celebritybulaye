"use client";

import React from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useCelebrities } from "@/hooks/useCelebrities";
import { eventTypes } from "@/data/eventTypes";

interface CelebrityFiltersProps {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedLocation: string;
  selectedEventType: string;
  onCategoryChange: (cat: string) => void;
  onSubcategoryChange: (sub: string) => void;
  onLocationChange: (loc: string) => void;
  onEventTypeChange: (event: string) => void;
  onReset: () => void;
}

export const CelebrityFilters: React.FC<CelebrityFiltersProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedLocation,
  selectedEventType,
  onCategoryChange,
  onSubcategoryChange,
  onLocationChange,
  onEventTypeChange,
  onReset,
}) => {
  const { activeCategories } = useCategories();
  const { locations } = useCelebrities();

  const currentCategoryObj = activeCategories.find(
    (c) => c.slug.toLowerCase() === selectedCategory.toLowerCase()
  );

  const activeSubcategories = (currentCategoryObj?.subcategories || []).filter(
    (s) => s.status !== "inactive"
  );

  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedSubcategory !== "all" ||
    selectedLocation !== "all" ||
    selectedEventType !== "all";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9B111E]" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-serif">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#9B111E] hover:text-[#740D16]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
          Category
        </label>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-red-50 text-[#9B111E] font-bold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "all" && <Check className="w-3.5 h-3.5 text-[#9B111E]" />}
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? "bg-red-50 text-[#9B111E] font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-gray-400">({cat.displayCount || cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Filter (shown if category selected and has subcategories) */}
      {currentCategoryObj && activeSubcategories.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
            {currentCategoryObj.name} Specialization
          </label>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSubcategoryChange("all")}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedSubcategory === "all"
                  ? "bg-red-50 text-[#9B111E] font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>All {currentCategoryObj.name}s</span>
              {selectedSubcategory === "all" && <Check className="w-3.5 h-3.5 text-[#9B111E]" />}
            </button>
            {activeSubcategories.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => onSubcategoryChange(sub.slug)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedSubcategory === sub.slug
                    ? "bg-red-50 text-[#9B111E] font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{sub.name}</span>
                {selectedSubcategory === sub.slug && (
                  <Check className="w-3.5 h-3.5 text-[#9B111E]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location Filter */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
          City / Location
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] bg-white text-gray-800"
        >
          <option value="all">All Cities</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Event Type Filter */}
      <div className="pt-4 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">
          Event Format
        </label>
        <select
          value={selectedEventType}
          onChange={(e) => onEventTypeChange(e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] bg-white text-gray-800"
        >
          <option value="all">All Event Formats</option>
          {eventTypes.map((et) => (
            <option key={et.id} value={et.name}>
              {et.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
