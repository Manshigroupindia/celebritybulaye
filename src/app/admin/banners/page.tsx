"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Sliders,
  Eye,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  X,
} from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { HeroBanner, CreateBannerInput, UpdateBannerInput } from "@/types/banner";
import { BannerFormModal } from "@/components/admin/banners/BannerFormModal";
import { BannerPreviewModal } from "@/components/admin/banners/BannerPreviewModal";
import { BannerDeleteConfirmModal } from "@/components/admin/banners/BannerDeleteConfirmModal";

export default function AdminBannersPage() {
  const {
    banners,
    activeBanners,
    isMounted,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    reorderBanners,
    resetBanners,
  } = useBanners();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingBanner, setPreviewingBanner] = useState<HeroBanner | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState<HeroBanner | null>(null);

  // Feedback notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtered banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchHeading = b.heading?.toLowerCase().includes(q);
          return matchTitle || matchHeading;
        }
        return true;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [banners, searchQuery, statusFilter]);

  // Handlers
  const handleAddNew = () => {
    setEditingBanner(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setIsFormModalOpen(true);
  };

  const handlePreview = (banner: HeroBanner) => {
    setPreviewingBanner(banner);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteClick = (banner: HeroBanner) => {
    setDeletingBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const handleSaveBanner = async (data: CreateBannerInput): Promise<boolean> => {
    if (editingBanner) {
      const res = await updateBanner(editingBanner.id, data);
      if (res.success) {
        showToast(`Banner "${data.title}" updated successfully.`);
        return true;
      }
      showToast(res.error || "Failed to update banner.", "error");
      return false;
    } else {
      const res = await createBanner(data);
      if (res.success) {
        showToast(`Banner "${data.title}" created successfully.`);
        return true;
      }
      showToast(res.error || "Failed to create banner.", "error");
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBanner) return;
    const res = await deleteBanner(deletingBanner.id);
    if (res.success) {
      showToast(`Banner "${deletingBanner.title}" has been deleted.`);
      setIsDeleteModalOpen(false);
      setDeletingBanner(null);
    } else {
      showToast(res.error || "Failed to delete banner.", "error");
    }
  };

  const handleToggleStatus = async (banner: HeroBanner) => {
    const res = await toggleBannerStatus(banner.id);
    if (res.success) {
      const updatedStatus = banner.status === "active" ? "hidden" : "active";
      showToast(`Banner is now ${updatedStatus} on the public homepage.`);
    } else {
      showToast(res.error || "Failed to toggle status.", "error");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const currentList = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetItem = currentList[index];
    const prevItem = currentList[index - 1];

    currentList[index] = prevItem;
    currentList[index - 1] = targetItem;

    const orderedIds = currentList.map((b) => b.id);
    const res = await reorderBanners(orderedIds);
    if (res.success) {
      showToast(`Display order updated.`);
    } else {
      showToast(res.error || "Failed to update display order.", "error");
    }
  };

  const handleMoveDown = async (index: number) => {
    const currentList = [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
    if (index >= currentList.length - 1) return;
    const targetItem = currentList[index];
    const nextItem = currentList[index + 1];

    currentList[index] = nextItem;
    currentList[index + 1] = targetItem;

    const orderedIds = currentList.map((b) => b.id);
    const res = await reorderBanners(orderedIds);
    if (res.success) {
      showToast(`Display order updated.`);
    } else {
      showToast(res.error || "Failed to update display order.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif tracking-tight">
              Hero Banner Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#9B111E] text-xs font-bold border border-red-200">
              {activeBanners.length} Active {activeBanners.length === 1 ? "Slide" : "Slides"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-light">
            Manage the promotional banners displayed in the homepage hero section.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 transition-colors shadow-xs"
            title="Preview live homepage in new tab"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-md shadow-red-950/20 transition-all transform active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Banner</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`border px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in shadow-xs ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 ${
                toast.type === "error" ? "text-red-600" : "text-emerald-600"
              }`}
            />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className={toast.type === "error" ? "text-red-700 hover:text-red-900" : "text-emerald-700 hover:text-emerald-900"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search banners by title or heading..."
            className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:border-[#9B111E] focus:bg-white outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "all"
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All ({banners.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            Active ({activeBanners.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === "inactive"
                ? "bg-gray-700 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inactive ({banners.length - activeBanners.length})
          </button>
        </div>
      </div>

      {/* Banner Cards Grid / Table */}
      {filteredBanners.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#9B111E] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 font-serif mb-1">
            {searchQuery || statusFilter !== "all"
              ? "No Banners Match Your Filter"
              : "No Hero Banners Configured"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 font-light">
            {searchQuery || statusFilter !== "all"
              ? "Try clearing your search term or selecting a different status filter."
              : "When no banners are added, the homepage seamlessly displays the fallback hero configured in Site Settings."}
          </p>

          <div className="flex items-center justify-center gap-3">
            {searchQuery || statusFilter !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Create First Banner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetBanners();
                    showToast("Restored initial hero demo banners.");
                  }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Demo Banners</span>
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Banners Listing Cards */
        <div className="space-y-4">
          {filteredBanners.map((banner, index) => {
            const isActive = banner.status === "active";
            const isFirst = index === 0;
            const isLast = index === filteredBanners.length - 1;

            return (
              <div
                key={banner.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                  isActive ? "border-gray-200/90" : "border-gray-200 bg-gray-50/50 opacity-80"
                }`}
              >
                {/* Left: Thumbnail & Banner Details */}
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-28 sm:w-36 aspect-16/9 rounded-xl bg-gray-900 border border-gray-200 overflow-hidden shrink-0 shadow-xs group">
                    <Image
                      src={banner.desktopImage}
                      alt={banner.title}
                      fill
                      sizes="150px"
                      className="object-cover"
                      unoptimized
                    />
                    {banner.overlayEnabled && (
                      <div
                        className="absolute inset-0 bg-black pointer-events-none"
                        style={{ opacity: (banner.overlayIntensity ?? 70) / 100 }}
                      />
                    )}

                    {/* Order badge on thumbnail */}
                    <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-bold text-white flex items-center justify-center border border-white/20">
                      #{banner.displayOrder}
                    </span>

                    {/* Mobile icon badge if mobile image exists */}
                    {banner.mobileImage && (
                      <span
                        className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/40"
                        title="Dedicated mobile banner configured"
                      >
                        <Smartphone className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {banner.title}
                      </h3>
                      {isActive ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Slide
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          Hidden
                        </span>
                      )}
                    </div>

                    {banner.heading && (
                      <p className="text-xs font-medium text-gray-700 line-clamp-1">
                        &ldquo;{banner.heading}&rdquo;
                      </p>
                    )}

                    {banner.description && (
                      <p className="text-[11px] text-gray-500 line-clamp-1">
                        {banner.description}
                      </p>
                    )}

                    {/* Meta tags */}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-blue-500" />
                        <span>Desktop</span>
                      </span>
                      {banner.mobileImage ? (
                        <span className="flex items-center gap-1 text-purple-600 font-medium">
                          <Smartphone className="w-3 h-3" />
                          <span>Custom Mobile</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Smartphone className="w-3 h-3" />
                          <span>Auto Cropped</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="capitalize">Align: {banner.textPosition}</span>
                      {banner.primaryCta?.enabled && (
                        <>
                          <span>•</span>
                          <span className="text-gray-600">CTA: {banner.primaryCta.label}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Controls & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 shrink-0">
                  {/* Reorder Up/Down */}
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move slide earlier in carousel"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="Move slide later in carousel"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Active Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(banner)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    }`}
                    title={isActive ? "Click to deactivate" : "Click to activate"}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                      }`}
                    />
                    <span>{isActive ? "Active" : "Inactive"}</span>
                  </button>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={() => handlePreview(banner)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-colors"
                    title="Live Simulation Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-gray-600 hover:text-[#9B111E] hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"
                    title="Edit Banner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(banner)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition-colors"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Instructions / Information */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C5A059]" />
          <span>
            Multiple active banners automatically form a smooth carousel slider in the homepage hero.
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            resetBanners();
            showToast("Restored initial demo banners.");
          }}
          className="text-xs text-gray-400 hover:text-[#9B111E] transition-colors underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Demo Banners</span>
        </button>
      </div>

      {/* Modals */}
      <BannerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveBanner}
        initialBanner={editingBanner}
      />

      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        banner={previewingBanner}
      />

      <BannerDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        banner={deletingBanner}
      />
    </div>
  );
}
