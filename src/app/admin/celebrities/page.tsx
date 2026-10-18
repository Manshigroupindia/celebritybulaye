"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Power,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { Celebrity } from "@/types";
import { useCelebrities } from "@/hooks/useCelebrities";
import { useCategories } from "@/hooks/useCategories";
import { CelebrityWizardModal } from "@/components/admin/CelebrityWizardModal";
import { CelebrityDetailsModal } from "@/components/admin/CelebrityDetailsModal";
import { CelebrityDeleteDialog } from "@/components/admin/CelebrityDeleteDialog";
import { Toast, ToastMessage } from "@/components/admin/Toast";

export default function AdminCelebritiesPage() {
  const {
    celebrities,
    isMounted,
    createCelebrity,
    updateCelebrity,
    deleteCelebrity,
    toggleCelebrityStatus,
    resetToDefault,
  } = useCelebrities();

  const { activeCategories } = useCategories();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "draft">("all");
  const [sortBy, setSortBy] = useState<"recent" | "az" | "za" | "experience">("recent");

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [celebrityToEdit, setCelebrityToEdit] = useState<Celebrity | null>(null);

  const [detailsCelebrity, setDetailsCelebrity] = useState<Celebrity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Celebrity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query parameter handling for quick actions (?action=create or ?edit=celeb-xxx)
  React.useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "create") {
        setCelebrityToEdit(null);
        setIsWizardOpen(true);
      } else {
        const editId = params.get("edit");
        if (editId) {
          const found = celebrities.find((c) => c.id === editId || c.slug === editId);
          if (found) {
            setCelebrityToEdit(found);
            setIsWizardOpen(true);
          }
        }
      }
    }
  }, [isMounted, celebrities]);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({
      id: `${Date.now()}`,
      type,
      message,
    });
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = celebrities.length;
    const active = celebrities.filter((c) => (c.status ?? "active") === "active").length;
    const featured = celebrities.filter((c) => c.featured).length;
    const drafts = celebrities.filter((c) => c.status === "draft").length;
    return { total, active, featured, drafts };
  }, [celebrities]);

  // Filtered & Sorted Celebrities
  const filteredCelebrities = useMemo(() => {
    let result = [...celebrities];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => (c.status ?? "active") === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      const catLower = categoryFilter.toLowerCase();
      result = result.filter(
        (c) =>
          c.categorySlug?.toLowerCase() === catLower ||
          c.category?.toLowerCase() === catLower
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.subcategory && c.subcategory.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.livingLocation && c.livingLocation.toLowerCase().includes(q)) ||
          c.specialties?.some((s) => s.toLowerCase().includes(q)) ||
          c.shortDescription?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "experience") {
      result.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else {
      // recent first
      result.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return result;
  }, [celebrities, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Handle Wizard Save
  const handleSaveWizard = async (payload: Partial<Celebrity>, isDraft?: boolean) => {
    if (celebrityToEdit) {
      // Update existing
      const res = await updateCelebrity(celebrityToEdit.id, payload);
      if (res.success) {
        showToast(
          `Profile for ${res.celebrity?.name} updated successfully.`,
          "success"
        );
        return { success: true };
      }
      return { success: false, error: res.error };
    } else {
      // Create new
      const res = await createCelebrity(payload as any);
      if (res.success) {
        showToast(
          isDraft
            ? `Celebrity ${res.celebrity?.name} saved as Draft.`
            : `Celebrity ${res.celebrity?.name} published successfully!`,
          "success"
        );
        return { success: true };
      }
      return { success: false, error: res.error };
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (id: string, name: string, currentStatus?: string) => {
    const res = await toggleCelebrityStatus(id);
    if (res.success) {
      const newStatus = res.celebrity?.status;
      showToast(
        `${name} is now ${newStatus === "active" ? "Active (visible on website)" : "Inactive (hidden from website)"}.`,
        newStatus === "active" ? "success" : "info"
      );
    } else {
      showToast(res.error || "Failed to change status.", "error");
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await deleteCelebrity(deleteTarget.id);
      if (res.success) {
        showToast(`Profile for ${deleteTarget.name} deleted successfully.`, "success");
        setDeleteTarget(null);
      } else {
        showToast(res.error || "Failed to delete celebrity.", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Reset to Default Demo Data
  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all celebrity profiles to the original demo data? Any newly created profiles will be replaced."
      )
    ) {
      const res = resetToDefault();
      if (res.success) {
        showToast(`Reset to default ${res.count} celebrity records successfully.`, "info");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-serif">
              Celebrities Management
            </h1>
            <span className="text-xs bg-red-50 text-[#9B111E] font-bold px-2.5 py-0.5 rounded-full border border-red-200/60">
              {celebrities.length} Profiles
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Manage celebrity profiles, booking information and media.
          </p>
        </div>

        {/* Action Button: + Add Celebrity */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default seed data"
            className="p-2.5 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setCelebrityToEdit(null);
              setIsWizardOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all hover:shadow-lg active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Celebrity</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Celebrities */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Total Celebrities
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-900 font-serif">
                {metrics.total}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">profiles</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#9B111E] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Profiles */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Active Profiles
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 font-serif">
                {metrics.active}
              </span>
              <span className="text-[11px] text-emerald-800 font-medium">live on site</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Featured Celebrities */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
              Featured Celebrities
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-800 font-serif">
                {metrics.featured}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">homepage featured</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by celebrity name, location or specialty..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-gray-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white text-gray-800"
            >
              <option value="all">All Categories</option>
              {activeCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <div className="relative w-full">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white text-gray-800"
              >
                <option value="recent">Sort: Recently Added</option>
                <option value="az">Sort: Name (A-Z)</option>
                <option value="za">Sort: Name (Z-A)</option>
                <option value="experience">Sort: Experience (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {(["all", "active", "inactive", "draft"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? "bg-[#9B111E] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredCelebrities.length}</strong> of{" "}
            {celebrities.length} celebrities
          </div>
        </div>
      </div>

      {/* Celebrities Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-16">Profile</th>
                <th className="py-3.5 px-4">Celebrity Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Available For</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCelebrities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">No celebrities match your criteria</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Try clearing search filters or add a new celebrity profile using the button above.
                    </p>
                    {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("all");
                          setStatusFilter("all");
                        }}
                        className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCelebrities.map((celeb) => {
                  const mainImg = celeb.mainImage || celeb.profileImage || "";
                  const loc = celeb.livingLocation || celeb.location || "Mumbai";
                  const events = celeb.availableFor || celeb.eventTypes || [];
                  const isPublished = (celeb.status ?? "active") === "active";

                  return (
                    <tr
                      key={celeb.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Thumbnail Image */}
                      <td className="py-3.5 px-4">
                        <div className="relative w-11 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          {mainImg ? (
                            <Image
                              src={mainImg}
                              alt={celeb.name}
                              fill
                              className="object-cover object-top"
                              sizes="44px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                              No Pic
                            </div>
                          )}
                          {celeb.verified && (
                            <div
                              className="absolute bottom-0 right-0 bg-blue-600 text-white p-0.5 rounded-tl-md shadow-2xs"
                              title="Verified Talent"
                            >
                              <ShieldCheck className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Celebrity Name */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm font-serif group-hover:text-[#9B111E] transition-colors">
                              {celeb.name}
                            </span>
                            {celeb.featured && (
                              <span
                                className="inline-flex p-0.5 rounded-full bg-amber-50 text-amber-700"
                                title="Featured on Homepage"
                              >
                                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-gray-400 block truncate max-w-xs">
                            /{celeb.slug}
                          </span>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-50 text-[#9B111E] font-bold text-[11px] border border-red-100">
                            {celeb.category}
                          </span>
                          {celeb.subcategory && (
                            <span className="block text-[10px] text-gray-500 font-medium">
                              {celeb.subcategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-gray-700">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{loc}</span>
                        </div>
                      </td>

                      {/* Available For */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {events.slice(0, 2).map((evt) => (
                            <span
                              key={evt}
                              className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium"
                            >
                              {evt}
                            </span>
                          ))}
                          {events.length > 2 && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold"
                              title={events.slice(2).join(", ")}
                            >
                              +{events.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            celeb.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : celeb.status === "draft"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              celeb.status === "active"
                                ? "bg-emerald-600"
                                : celeb.status === "draft"
                                ? "bg-amber-500"
                                : "bg-gray-400"
                            }`}
                          />
                          <span>{celeb.status || "active"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* View Profile */}
                          <button
                            type="button"
                            onClick={() => setDetailsCelebrity(celeb)}
                            title="View Profile Details"
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            type="button"
                            onClick={() => {
                              setCelebrityToEdit(celeb);
                              setIsWizardOpen(true);
                            }}
                            title="Edit Profile"
                            className="p-1.5 text-gray-500 hover:text-[#9B111E] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(celeb.id, celeb.name, celeb.status)}
                            title={isPublished ? "Deactivate (Hide from site)" : "Activate (Publish to site)"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPublished
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(celeb)}
                            title="Delete Celebrity"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-Step Wizard Modal */}
      <CelebrityWizardModal
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setCelebrityToEdit(null);
        }}
        celebrityToEdit={celebrityToEdit}
        onSave={handleSaveWizard}
      />

      {/* Profile Details Modal */}
      <CelebrityDetailsModal
        isOpen={Boolean(detailsCelebrity)}
        celebrity={detailsCelebrity}
        onClose={() => setDetailsCelebrity(null)}
        onEdit={(celeb) => {
          setDetailsCelebrity(null);
          setCelebrityToEdit(celeb);
          setIsWizardOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <CelebrityDeleteDialog
        isOpen={Boolean(deleteTarget)}
        celebrity={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
