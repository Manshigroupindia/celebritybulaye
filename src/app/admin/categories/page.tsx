"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Power,
  ChevronDown,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Layers,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import { Category, SubCategory } from "@/types";
import { useCategories } from "@/hooks/useCategories";
import { CategoryFormModal } from "@/components/admin/CategoryFormModal";
import { SubcategoryFormModal } from "@/components/admin/SubcategoryFormModal";
import { CategoryDetailsModal } from "@/components/admin/CategoryDetailsModal";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Toast, ToastMessage } from "@/components/admin/Toast";

export default function AdminCategoriesPage() {
  const {
    categories,
    isMounted,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
    resetToDefault,
  } = useCategories();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modals State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryParentId, setSubcategoryParentId] = useState<string>("");
  const [subcategoryToEdit, setSubcategoryToEdit] = useState<SubCategory | null>(null);

  const [detailsCategory, setDetailsCategory] = useState<Category | null>(null);

  // Query parameter handling for quick actions (?action=create or ?edit=cat-xxx)
  React.useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "create") {
        setCategoryToEdit(null);
        setIsCategoryModalOpen(true);
      } else {
        const editId = params.get("edit");
        if (editId) {
          const found = categories.find((c) => c.id === editId || c.slug === editId);
          if (found) {
            setCategoryToEdit(found);
            setIsCategoryModalOpen(true);
          }
        }
      }
    }
  }, [isMounted, categories]);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "subcategory";
    parentCategoryId?: string;
    item: Category | SubCategory;
  } | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({
      id: `${Date.now()}`,
      type,
      message,
    });
  };

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => (c.status ?? "active") === "active").length;
    const totalSubcategories = categories.reduce(
      (sum, c) => sum + (c.subcategories?.length || 0),
      0
    );
    return { totalCategories, activeCategories, totalSubcategories };
  }, [categories]);

  // Filtered Categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    if (statusFilter !== "all") {
      result = result.filter((c) => (c.status ?? "active") === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.subcategories &&
            c.subcategories.some(
              (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
            ))
      );
    }

    return result.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
  }, [categories, statusFilter, searchQuery]);

  // Category CRUD Handlers
  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: {
    name: string;
    slug: string;
    image: string;
    description: string;
    displayCount?: string;
    displayOrder: number;
    status: "active" | "inactive";
  }) => {
    try {
      if (categoryToEdit) {
        await updateCategory(categoryToEdit.id, data);
        showToast(`Category "${data.name}" updated successfully.`);
      } else {
        await createCategory(data);
        showToast(`Category "${data.name}" created successfully and published.`);
      }
      setIsCategoryModalOpen(false);
      setCategoryToEdit(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save category.", "error");
    }
  };

  const handleToggleCategoryStatus = async (id: string, name: string) => {
    try {
      const updated = await toggleCategoryStatus(id);
      showToast(
        `Category "${name}" is now ${updated.status === "active" ? "Active (Visible)" : "Inactive (Hidden)"}.`,
        "info"
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle status.", "error");
    }
  };

  // Subcategory CRUD Handlers
  const handleOpenAddSubcategory = (parentId?: string) => {
    const parent = parentId || (categories[0]?.id ?? "");
    setSubcategoryParentId(parent);
    setSubcategoryToEdit(null);
    setIsSubcategoryModalOpen(true);
  };

  const handleOpenEditSubcategory = (parentCatId: string, sub: SubCategory) => {
    setSubcategoryParentId(parentCatId);
    setSubcategoryToEdit(sub);
    setIsSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = async (
    parentCatId: string,
    data: {
      name: string;
      slug: string;
      description: string;
      image?: string;
      displayOrder: number;
      status: "active" | "inactive";
    }
  ) => {
    try {
      if (subcategoryToEdit) {
        await updateSubcategory(parentCatId, subcategoryToEdit.id || subcategoryToEdit.slug, data);
        showToast(`Subcategory "${data.name}" updated successfully.`);
      } else {
        await createSubcategory(parentCatId, data);
        showToast(`Subcategory "${data.name}" added successfully.`);
      }
      setIsSubcategoryModalOpen(false);
      setSubcategoryToEdit(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save subcategory.", "error");
    }
  };

  const handleToggleSubcategoryStatus = async (parentCatId: string, subIdOrSlug: string) => {
    try {
      const updated = await toggleSubcategoryStatus(parentCatId, subIdOrSlug);
      showToast(
        `Subcategory "${updated.name}" is now ${
          updated.status === "active" ? "Active (Visible)" : "Inactive (Hidden)"
        }.`,
        "info"
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to toggle subcategory status.", "error");
    }
  };

  // Delete Action Confirm Execution
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "category") {
        const cat = deleteTarget.item as Category;
        await deleteCategory(cat.id);
        showToast(`Category "${cat.name}" and its subcategories were deleted.`, "info");
      } else {
        const sub = deleteTarget.item as SubCategory;
        if (deleteTarget.parentCategoryId) {
          await deleteSubcategory(deleteTarget.parentCategoryId, sub.id || sub.slug);
          showToast(`Subcategory "${sub.name}" was deleted.`, "info");
        }
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete operation failed.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-0.5 w-4 bg-[#9B111E]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B111E]">
              CMS Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Create and manage the categories and subcategories displayed across Celebrity Bulaye.
          </p>
        </div>

        {/* Dual Primary Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenAddSubcategory()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-[#9B111E] hover:text-[#9B111E] bg-white text-gray-700 text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#C5A059]" />
            <span>+ Add Subcategory</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold shadow-md shadow-red-950/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wider">
              Total Categories
            </span>
            <div className="text-3xl font-extrabold font-serif text-gray-900">
              {metrics.totalCategories}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Configured in CMS</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#9B111E] flex items-center justify-center border border-red-100/60">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        {/* Total Subcategories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wider">
              Total Subcategories
            </span>
            <div className="text-3xl font-extrabold font-serif text-gray-900">
              {metrics.totalSubcategories}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Specializations mapped</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#C5A059] flex items-center justify-center border border-amber-100/60">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-1 uppercase tracking-wider">
              Active Categories
            </span>
            <div className="text-3xl font-extrabold font-serif text-emerald-700">
              {metrics.activeCategories}
            </div>
            <span className="text-[11px] text-emerald-600 mt-0.5 block">Visible to public</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search, Status Filters & Reset Button */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category name, slug, subcategory..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#9B111E]"
          />
        </div>

        {/* Right Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl text-xs font-semibold text-gray-700">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === "all" ? "bg-white text-gray-900 shadow-xs" : "hover:text-gray-900"
              }`}
            >
              All ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === "active" ? "bg-white text-emerald-700 shadow-xs" : "hover:text-gray-900"
              }`}
            >
              Active ({metrics.activeCategories})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === "inactive" ? "bg-white text-red-700 shadow-xs" : "hover:text-gray-900"
              }`}
            >
              Inactive ({metrics.totalCategories - metrics.activeCategories})
            </button>
          </div>

          {/* Reset Demo Seed Data */}
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reset category data back to the default 8 seed categories? Any newly added test categories will be reset."
                )
              ) {
                resetToDefault();
                showToast("Categories restored to default seed state.", "info");
              }
            }}
            title="Reset to default seed categories"
            className="p-2 border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-[#9B111E] rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Management Table */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 w-18">Image</th>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Subcategories</th>
                <th className="py-3.5 px-4">Display Label</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-800">No categories found.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try clearing your search query or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category, index) => {
                  const isRowExpanded = expandedRowId === category.id;
                  const isActive = (category.status ?? "active") === "active";
                  const subCount = category.subcategories?.length || 0;

                  return (
                    <React.Fragment key={category.id}>
                      <tr className="hover:bg-red-50/20 transition-colors group">
                        {/* Expand toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedRowId(isRowExpanded ? null : category.id)
                            }
                            className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                            title={isRowExpanded ? "Collapse subcategories" : "Expand subcategories"}
                          >
                            {isRowExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#9B111E]" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Image Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        </td>

                        {/* Category Name & Description */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900 font-serif text-sm">
                            {category.name}
                          </div>
                          <div className="text-[11px] text-gray-400 line-clamp-1 max-w-xs font-light">
                            {category.description}
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[11px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                            /{category.slug}
                          </span>
                        </td>

                        {/* Subcategories Count & Pills */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            <span className="text-[10px] font-bold bg-[#FFE5A3] text-amber-950 px-2 py-0.5 rounded-full border border-amber-300/60">
                              {subCount} Types
                            </span>
                            {category.subcategories?.slice(0, 2).map((s) => (
                              <span
                                key={s.slug}
                                className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[100px]"
                              >
                                {s.name}
                              </span>
                            ))}
                            {subCount > 2 && (
                              <span className="text-[10px] text-gray-400">+{subCount - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Display Count Label */}
                        <td className="py-3.5 px-4 font-semibold text-gray-700 text-xs">
                          {category.displayCount || `${category.count || 0}+ Celebrities`}
                        </td>

                        {/* Status Toggle Badge */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryStatus(category.id, category.name)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            <Power className="w-3 h-3" />
                            <span>{isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setDetailsCategory(category)}
                              title="View Details & Subcategories"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-[#9B111E] hover:bg-red-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(category)}
                              title="Edit Category"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: "category",
                                  item: category,
                                })
                              }
                              title="Delete Category"
                              className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Subcategory Accordion Row */}
                      {isRowExpanded && (
                        <tr className="bg-gray-50/70 border-b border-gray-200">
                          <td colSpan={8} className="p-4 sm:p-5 pl-14">
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-[#C5A059]" />
                                  <span className="text-xs font-bold text-gray-900 font-serif">
                                    Subcategories under &ldquo;{category.name}&rdquo; ({subCount})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddSubcategory(category.id)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-[#9B111E] text-[#9B111E] hover:text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Subcategory</span>
                                </button>
                              </div>

                              {subCount === 0 ? (
                                <p className="text-xs text-gray-400 italic py-2">
                                  No subcategories registered yet under this category.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                  {category.subcategories.map((sub) => {
                                    const subActive = (sub.status ?? "active") === "active";
                                    return (
                                      <div
                                        key={sub.slug}
                                        className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-2 hover:bg-white hover:shadow-xs transition-all"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-gray-800 text-xs truncate">
                                              {sub.name}
                                            </span>
                                            <span
                                              className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                                                subActive
                                                  ? "bg-emerald-100 text-emerald-800"
                                                  : "bg-gray-200 text-gray-600"
                                              }`}
                                            >
                                              {sub.status || "active"}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-gray-400 font-mono truncate">
                                            /{sub.slug}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleToggleSubcategoryStatus(
                                                category.id,
                                                sub.id || sub.slug
                                              )
                                            }
                                            title="Toggle Subcategory status"
                                            className={`p-1 rounded text-xs ${
                                              subActive
                                                ? "text-emerald-700 hover:bg-emerald-50"
                                                : "text-gray-400 hover:bg-gray-100"
                                            }`}
                                          >
                                            <Power className="w-3 h-3" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleOpenEditSubcategory(category.id, sub)
                                            }
                                            title="Edit subcategory"
                                            className="p-1 rounded text-gray-500 hover:text-blue-700 hover:bg-blue-50"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              setDeleteTarget({
                                                type: "subcategory",
                                                parentCategoryId: category.id,
                                                item: sub,
                                              })
                                            }
                                            title="Delete subcategory"
                                            className="p-1 rounded text-gray-400 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSave={handleSaveCategory}
      />

      <SubcategoryFormModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => {
          setIsSubcategoryModalOpen(false);
          setSubcategoryToEdit(null);
        }}
        categories={categories}
        initialParentCategoryId={subcategoryParentId}
        subcategoryToEdit={subcategoryToEdit}
        onSave={handleSaveSubcategory}
      />

      <CategoryDetailsModal
        isOpen={Boolean(detailsCategory)}
        onClose={() => setDetailsCategory(null)}
        category={detailsCategory}
        onEditCategory={handleOpenEditCategory}
        onAddSubcategory={(parentId) => handleOpenAddSubcategory(parentId)}
        onEditSubcategory={(parentId, sub) => handleOpenEditSubcategory(parentId, sub)}
        onToggleSubcategoryStatus={handleToggleSubcategoryStatus}
        onDeleteSubcategory={(parentId, sub) =>
          setDeleteTarget({
            type: "subcategory",
            parentCategoryId: parentId,
            item: sub,
          })
        }
      />

      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleExecuteDelete}
        title={
          deleteTarget?.type === "category" ? "Delete Category" : "Delete Subcategory"
        }
        itemName={deleteTarget?.item.name || ""}
        subcategoriesCount={
          deleteTarget?.type === "category"
            ? (deleteTarget.item as Category).subcategories?.length || 0
            : 0
        }
        warningDetails={
          deleteTarget?.type === "subcategory"
            ? "This will remove the subcategory specialization from the parent category navigation and filters."
            : undefined
        }
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
