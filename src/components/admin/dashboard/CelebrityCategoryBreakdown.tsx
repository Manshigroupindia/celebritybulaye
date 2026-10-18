"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { FolderTree, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { Celebrity, Category } from "@/types";

interface CelebrityCategoryBreakdownProps {
  celebrities: Celebrity[];
  categories: Category[];
  isMounted: boolean;
}

interface CategoryStatItem {
  id: string;
  name: string;
  slug: string;
  activeCount: number;
  totalCount: number;
  subcategoriesCount: number;
  percentage: number;
  status: "active" | "inactive";
}

export const CelebrityCategoryBreakdown: React.FC<CelebrityCategoryBreakdownProps> = ({
  celebrities,
  categories,
  isMounted,
}) => {
  const stats = useMemo(() => {
    const totalCelebrities = celebrities.length;
    const items: CategoryStatItem[] = [];
    const matchedCelebrityIds = new Set<string>();

    // 1. Process all registered categories
    categories.forEach((cat) => {
      const catSlugLower = cat.slug.toLowerCase();
      const catNameLower = cat.name.toLowerCase();

      const matched = celebrities.filter((c) => {
        const match =
          (c.categoryId && c.categoryId === cat.id) ||
          (c.categorySlug && c.categorySlug.toLowerCase() === catSlugLower) ||
          (c.category && c.category.toLowerCase() === catNameLower);

        if (match) {
          matchedCelebrityIds.add(c.id);
        }
        return match;
      });

      const totalCount = matched.length;
      const activeCount = matched.filter(
        (c) => (c.status ?? "active") === "active"
      ).length;

      const percentage =
        totalCelebrities > 0
          ? Math.round((totalCount / totalCelebrities) * 100)
          : 0;

      items.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        activeCount,
        totalCount,
        subcategoriesCount: cat.subcategories?.length || 0,
        percentage,
        status: (cat.status ?? "active") as "active" | "inactive",
      });
    });

    // 2. Identify any celebrities belonging to unregistered/custom categories
    const unmatchedCelebrities = celebrities.filter(
      (c) => !matchedCelebrityIds.has(c.id)
    );

    if (unmatchedCelebrities.length > 0) {
      const customGroups: { [key: string]: Celebrity[] } = {};
      unmatchedCelebrities.forEach((c) => {
        const key = c.category || "Unassigned";
        if (!customGroups[key]) customGroups[key] = [];
        customGroups[key].push(c);
      });

      Object.entries(customGroups).forEach(([catName, list]) => {
        const totalCount = list.length;
        const activeCount = list.filter(
          (c) => (c.status ?? "active") === "active"
        ).length;
        const percentage =
          totalCelebrities > 0
            ? Math.round((totalCount / totalCelebrities) * 100)
            : 0;

        items.push({
          id: `custom-${catName.toLowerCase().replace(/\s+/g, "-")}`,
          name: catName,
          slug: catName.toLowerCase().replace(/\s+/g, "-"),
          activeCount,
          totalCount,
          subcategoriesCount: 0,
          percentage,
          status: "active",
        });
      });
    }

    // Sort by total celebrity count descending
    items.sort((a, b) => b.totalCount - a.totalCount);

    return items;
  }, [celebrities, categories]);

  const totalActive = celebrities.filter(
    (c) => (c.status ?? "active") === "active"
  ).length;

  // Maximum count for relative bar scaling
  const maxCategoryCount = useMemo(() => {
    return Math.max(...stats.map((s) => s.totalCount), 1);
  }, [stats]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Portfolio Breakdown
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 font-serif">
            Celebrity Overview
          </h2>
          <p className="text-xs text-gray-500">
            Distribution of celebrity records across categories ({totalActive} active talents).
          </p>
        </div>

        <Link
          href="/admin/categories"
          className="text-xs font-semibold text-[#9B111E] hover:text-[#740D16] inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Manage Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Content */}
      <div className="pt-5">
        {stats.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">
              No Categories Available
            </h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Add your first category or seed initial data to view distribution.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.map((item, idx) => {
              // Bar width relative to maximum category count (min 3% for visibility if count > 0)
              const barWidthPercent =
                item.totalCount > 0
                  ? Math.max(Math.round((item.totalCount / maxCategoryCount) * 100), 4)
                  : 0;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-200/60"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 text-[11px] font-mono text-gray-400 font-bold shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Link
                        href={`/admin/celebrities?category=${encodeURIComponent(item.slug)}`}
                        className="font-bold text-gray-900 hover:text-[#9B111E] truncate transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.status === "inactive" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 uppercase tracking-wider shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="text-gray-500 text-[11px]">
                        <strong className="text-gray-900 font-bold">
                          {item.activeCount}
                        </strong>{" "}
                        active
                        {item.totalCount > item.activeCount && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            ({item.totalCount} total)
                          </span>
                        )}
                      </span>
                      <span className="w-12 text-[11px] font-mono text-gray-400 font-semibold">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Breakdown */}
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                    {item.totalCount === 0 ? (
                      <div className="w-full h-full bg-gray-100" />
                    ) : (
                      <>
                        {/* Active bar */}
                        <div
                          style={{ width: `${barWidthPercent}%` }}
                          className="h-full bg-gradient-to-r from-[#9B111E] to-[#C5A059] rounded-full transition-all duration-500"
                          title={`${item.activeCount} active celebrities`}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
