"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Power,
  FolderTree,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Category, SubCategory } from "@/types";

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEditCategory: (category: Category) => void;
  onAddSubcategory: (parentCategoryId: string) => void;
  onEditSubcategory: (parentCategoryId: string, subcategory: SubCategory) => void;
  onToggleSubcategoryStatus: (parentCategoryId: string, subcategoryId: string) => void;
  onDeleteSubcategory: (parentCategoryId: string, subcategory: SubCategory) => void;
}

export const CategoryDetailsModal: React.FC<CategoryDetailsModalProps> = ({
  isOpen,
  onClose,
  category,
  onEditCategory,
  onAddSubcategory,
  onEditSubcategory,
  onToggleSubcategoryStatus,
  onDeleteSubcategory,
}) => {
  if (!isOpen || !category) return null;

  const isActive = (category.status ?? "active") === "active";
  const subcategories = category.subcategories || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#740D16] to-[#9B111E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-[#FFE5A3]">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-serif">
                Category Details: {category.name}
              </h2>
              <p className="text-[11px] text-white/80">
                View category metadata and manage child subcategories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Category Summary Banner */}
          <div className="flex flex-col sm:flex-row gap-5 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
            {/* Image Thumbnail */}
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-200 shadow-sm">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>

            {/* Metadata Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 font-serif">{category.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {category.status || "active"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditCategory(category);
                  }}
                  className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-[#9B111E]" />
                  <span>Edit Category</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2 font-medium">
                <span className="font-mono text-[11px] text-[#9B111E]">
                  /category/{category.slug}
                </span>
                <span>•</span>
                <span>Display Order: #{category.displayOrder ?? 1}</span>
                <span>•</span>
                <span>Label: {category.displayCount || `${category.count || 0}+ Celebrities`}</span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-light">
                {category.description}
              </p>

              <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  Last Updated: {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : "Initial Seed"}
                </span>
                <a
                  href={`/category/${category.slug}`}
                  target="_blank"
                  className="text-[#9B111E] hover:underline flex items-center gap-1 font-semibold ml-auto"
                >
                  <span>Preview Public Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Child Subcategories Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-serif flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C5A059]" />
                  <span>Child Subcategories ({subcategories.length})</span>
                </h4>
                <p className="text-[11px] text-gray-500">
                  Targeted genres that appear in the public secondary red navigation dropdown
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddSubcategory(category.id);
                }}
                className="px-3 py-1.5 bg-[#9B111E] hover:bg-[#740D16] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Subcategory</span>
              </button>
            </div>

            {subcategories.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200/80">
                <Sparkles className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-800">No subcategories created yet.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Click the &ldquo;+ Add Subcategory&rdquo; button above to create specializations under {category.name}.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white">
                {subcategories.map((sub, idx) => {
                  const subActive = (sub.status ?? "active") === "active";

                  return (
                    <div
                      key={sub.id || sub.slug || idx}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{sub.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              subActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {sub.status || "active"}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          /category/{category.slug}/{sub.slug}
                        </div>
                        {sub.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-1">{sub.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => onToggleSubcategoryStatus(category.id, sub.id || sub.slug)}
                          title={subActive ? "Deactivate subcategory" : "Activate subcategory"}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            subActive
                              ? "text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              : "text-gray-400 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Subcategory */}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditSubcategory(category.id, sub);
                          }}
                          title="Edit subcategory"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#9B111E] hover:bg-red-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Subcategory */}
                        <button
                          type="button"
                          onClick={() => onDeleteSubcategory(category.id, sub)}
                          title="Delete subcategory"
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
