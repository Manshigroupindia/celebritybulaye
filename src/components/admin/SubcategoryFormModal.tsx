"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Sparkles, AlertCircle, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { Category, SubCategory } from "@/types";
import { generateSlug } from "@/services/categoryService";
import { uploadMediaFile } from "@/services/mediaService";

interface SubcategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialParentCategoryId?: string;
  subcategoryToEdit?: SubCategory | null;
  onSave: (
    parentCategoryId: string,
    data: {
      name: string;
      slug: string;
      description: string;
      image?: string;
      displayOrder: number;
      status: "active" | "inactive";
    }
  ) => void;
}

export const SubcategoryFormModal: React.FC<SubcategoryFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialParentCategoryId,
  subcategoryToEdit,
  onSave,
}) => {
  const isEditing = Boolean(subcategoryToEdit);

  const [parentCategoryId, setParentCategoryId] = useState(
    initialParentCategoryId || categories[0]?.id || ""
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subcategoryToEdit) {
      setName(subcategoryToEdit.name);
      setSlug(subcategoryToEdit.slug);
      setIsSlugManual(true);
      setDescription(subcategoryToEdit.description || "");
      setImage(subcategoryToEdit.image || "");
      setDisplayOrder(subcategoryToEdit.displayOrder ?? 1);
      setStatus(subcategoryToEdit.status || "active");
      if (initialParentCategoryId) {
        setParentCategoryId(initialParentCategoryId);
      }
    } else {
      setName("");
      setSlug("");
      setIsSlugManual(false);
      setDescription("");
      setImage("");
      setDisplayOrder(1);
      setStatus("active");
      if (initialParentCategoryId) {
        setParentCategoryId(initialParentCategoryId);
      } else if (categories.length > 0) {
        setParentCategoryId(categories[0].id);
      }
    }
    setFormErrors({});
  }, [subcategoryToEdit, initialParentCategoryId, categories, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
    if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(generateSlug(e.target.value));
    if (formErrors.slug) setFormErrors((p) => ({ ...p, slug: "" }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadMediaFile(file, {
        presetType: "general",
        prefix: "subcat",
        onProgress: (p) => setUploadProgress(p),
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to upload image.");
      }

      setImage(result.url);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!parentCategoryId) errs.parentCategoryId = "Please select a parent category.";
    if (!name.trim()) errs.name = "Subcategory title is required.";
    if (!slug.trim()) errs.slug = "Slug is required.";
    if (!description.trim()) errs.description = "Description is required.";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave(parentCategoryId, {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      displayOrder: Number(displayOrder) || 1,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#740D16] to-[#9B111E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-[#FFE5A3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-serif">
                {isEditing ? `Edit Subcategory: ${subcategoryToEdit?.name}` : "Create New Subcategory"}
              </h2>
              <p className="text-[11px] text-white/80">
                Attach a targeted specialization under a parent category
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Parent Category Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Select Parent Category <span className="text-red-600">*</span>
            </label>
            <select
              value={parentCategoryId}
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                if (formErrors.parentCategoryId) {
                  setFormErrors((p) => ({ ...p, parentCategoryId: "" }));
                }
              }}
              disabled={isEditing}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none bg-white font-medium text-gray-800 ${
                formErrors.parentCategoryId ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
              } ${isEditing ? "opacity-75 cursor-not-allowed bg-gray-100" : ""}`}
            >
              <option value="">Select Parent Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subcategories?.length || 0} subcategories)
                </option>
              ))}
            </select>
            {formErrors.parentCategoryId && (
              <p className="mt-1 text-[11px] text-red-600">{formErrors.parentCategoryId}</p>
            )}
          </div>

          {/* Subcategory Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subcategory Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Hollywood Actor"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none ${
                  formErrors.name ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                }`}
              />
              {formErrors.name && <p className="mt-1 text-[11px] text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="hollywood-actor"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono border rounded-xl outline-none ${
                  formErrors.slug ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                }`}
              />
              {formErrors.slug && <p className="mt-1 text-[11px] text-red-600">{formErrors.slug}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (formErrors.description) setFormErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Short description of this subcategory specialization..."
              className={`w-full p-3 text-xs sm:text-sm border rounded-xl outline-none ${
                formErrors.description ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
              }`}
            />
            {formErrors.description && <p className="mt-1 text-[11px] text-red-600">{formErrors.description}</p>}
          </div>

          {/* Subcategory Thumbnail / Image */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Subcategory Thumbnail / Image (Optional)
            </label>

            <div className="flex items-start gap-3 p-3 bg-gray-50/70 rounded-2xl border border-gray-200">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0 flex items-center justify-center">
                {image ? (
                  <Image src={image} alt="Subcategory preview" fill className="object-cover" unoptimized />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mb-0.5" />
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#9B111E]" />
                    <span>{isUploading ? `Uploading ${uploadProgress}%...` : "Upload Image"}</span>
                  </button>

                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  <span className="text-[10px] text-gray-400">Cloudinary cb-celebrities</span>
                </div>

                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Or enter direct URL: https://..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E] bg-white"
                />
              </div>
            </div>

            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Display Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E] bg-white font-semibold text-gray-800"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold shadow-md shadow-red-950/20 transition-all"
            >
              <span>{isEditing ? "Save Changes" : "Save Subcategory"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
