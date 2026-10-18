"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FolderTree, Edit2, ArrowRight, Layers, Users } from "lucide-react";
import { Category, Celebrity } from "@/types";

interface CategoryManagementOverviewProps {
  categories: Category[];
  celebrities: Celebrity[];
  isMounted: boolean;
}

export const CategoryManagementOverview: React.FC<CategoryManagementOverviewProps> = ({
  categories,
  celebrities,
  isMounted,
}) => {
  // Sort categories by displayOrder or name
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      return orderA - orderB;
    });
  }, [categories]);

  // Compute actual celebrity count per category (do NOT use marketing labels like count: 85)
  const categoryCelebrityCounts = useMemo(() => {
    const counts: { [catId: string]: number } = {};
    categories.forEach((cat) => {
      const catSlugLower = cat.slug.toLowerCase();
      const catNameLower = cat.name.toLowerCase();
      const matched = celebrities.filter(
        (c) =>
          (c.categoryId && c.categoryId === cat.id) ||
          (c.categorySlug && c.categorySlug.toLowerCase() === catSlugLower) ||
          (c.category && c.category.toLowerCase() === catNameLower)
      );
      counts[cat.id] = matched.length;
    });
    return counts;
  }, [categories, celebrities]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-3 bg-[#9B111E]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B111E]">
              Catalog Verticals
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 font-serif">
            Category Management
          </h2>
          <p className="text-xs text-gray-500">
            Overview of event categories, subcategories, and active rosters.
          </p>
        </div>

        <Link
          href="/admin/categories"
          className="text-xs font-semibold text-[#9B111E] hover:text-[#740D16] inline-flex items-center gap-1 shrink-0"
        >
          <span>Manage Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table / List */}
      <div className="pt-4 overflow-x-auto">
        {sortedCategories.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3 border border-gray-200">
              <FolderTree className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No categories configured.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click &quot;Add Category&quot; to define your first entertainment category.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="pb-3 pl-1">Category</th>
                <th className="pb-3 text-center">Subcategories</th>
                <th className="pb-3 text-center">Actual Talents</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedCategories.map((cat) => {
                const subCount = cat.subcategories?.length || 0;
                const celebCount = categoryCelebrityCounts[cat.id] ?? 0;
                const status = cat.status ?? "active";

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    {/* Category Name & Image */}
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0 shadow-2xs">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FolderTree className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/categories?edit=${cat.id}`}
                            className="font-bold text-gray-900 hover:text-[#9B111E] truncate block transition-colors text-xs sm:text-sm"
                          >
                            {cat.name}
                          </Link>
                          <span className="text-[11px] text-gray-400 font-mono block">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Subcategories count */}
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs">
                        <Layers className="w-3 h-3 text-gray-400" />
                        <span>{subCount}</span>
                      </span>
                    </td>

                    {/* Actual Celebrities count */}
                    <td className="py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                          celebCount > 0
                            ? "bg-red-50 text-[#9B111E] border border-red-100"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>{celebCount}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3">
                      {status === "active" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right pr-1">
                      <Link
                        href={`/admin/categories?edit=${cat.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-[#9B111E] hover:text-white text-gray-700 text-xs font-semibold transition-colors"
                        title="Edit category in modal"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
