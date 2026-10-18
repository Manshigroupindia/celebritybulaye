"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, UploadCloud, AlertCircle, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Category } from "@/types";
import { generateSlug } from "@/services/categoryService";
import { uploadMediaFile } from "@/services/mediaService";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSave: (data: {
    name: string;
    slug: string;
    image: string;
    description: string;
    displayCount?: string;
    displayOrder: number;
    status: "active" | "inactive";
  }) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSave,
}) => {
  const isEditing = Boolean(categoryToEdit);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [displayCount, setDisplayCount] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<"active" | "inactive">("active");

  const [previewImage, setPreviewImage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setIsSlugManual(true);
      setDescription(categoryToEdit.description);
      setImage(categoryToEdit.image);
      setPreviewImage(categoryToEdit.image);
      setDisplayCount(categoryToEdit.displayCount || `${categoryToEdit.count || 0}+ Celebrities`);
      setDisplayOrder(categoryToEdit.displayOrder ?? 1);
      setStatus(categoryToEdit.status || "active");
    } else {
      setName("");
      setSlug("");
      setIsSlugManual(false);
      setDescription("");
      setImage("");
      setPreviewImage("");
      setDisplayCount("");
      setDisplayOrder(1);
      setStatus("active");
    }
    setFormErrors({});
    setUploadError("");
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManual(true);
    setSlug(generateSlug(e.target.value));
    if (formErrors.slug) {
      setFormErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB.");
      return;
    }

    // Validate type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validMimes.includes(file.type)) {
      setUploadError("Please select a valid image file (JPG, PNG, WEBP, GIF, SVG).");
      return;
    }

    // Show temporary local preview while uploading
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewImage(localPreviewUrl);

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const result = await uploadMediaFile(file, {
        presetType: "general",
        prefix: "cat",
        onProgress: (p) => setUploadProgress(p),
      });

      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to upload image.");
      }

      setImage(result.url);
      setPreviewImage(result.url);
      if (formErrors.image) {
        setFormErrors((prev) => ({ ...prev, image: "" }));
      }
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "Category title is required.";
    if (!slug.trim()) errs.slug = "Slug is required.";
    if (!description.trim()) errs.description = "Description is required.";
    if (!image.trim() && !previewImage.trim()) errs.image = "Category image is required.";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      slug: slug.trim(),
      image: (image || previewImage).trim(),
      description: description.trim(),
      displayCount: displayCount.trim() || undefined,
      displayOrder: Number(displayOrder) || 1,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#740D16] to-[#9B111E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-[#FFE5A3]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-serif">
                {isEditing ? `Edit Category: ${categoryToEdit?.name}` : "Create New Category"}
              </h2>
              <p className="text-[11px] text-white/80">
                Configure primary category attributes for Celebrity Bulaye
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Category Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Stand-up Comedians"
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm border rounded-xl outline-none transition-colors ${
                  formErrors.name ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                }`}
              />
              {formErrors.name && <p className="mt-1 text-[11px] text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                URL Slug <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-mono">/category/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="stand-up-comedians"
                  className={`w-full pl-22 pr-3.5 py-2.5 text-xs sm:text-sm font-mono border rounded-xl outline-none transition-colors ${
                    formErrors.slug ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
                  }`}
                />
              </div>
              {formErrors.slug && <p className="mt-1 text-[11px] text-red-600">{formErrors.slug}</p>}
            </div>
          </div>

          {/* Category Image Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Image <span className="text-red-600">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              {/* Preview Box */}
              <div className="sm:col-span-4">
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Category Preview"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <div className="text-center p-3 text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] block font-medium">No Image Selected</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs gap-1.5 p-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#FFE5A3]" />
                      <span className="font-bold">Uploading {uploadProgress > 0 ? `${uploadProgress}%` : "..."}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Drop Area & Direct URL */}
              <div className="sm:col-span-8 space-y-2">
                <div className="border-2 border-dashed border-gray-200 hover:border-[#9B111E] rounded-2xl p-4 text-center relative transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-[#9B111E] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-800">
                    Click or drag image from computer
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    JPG, PNG, WEBP up to 10MB (Cloudinary cb-celebrities preset)
                  </p>
                </div>

                {/* Or enter Direct Image URL */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider shrink-0">
                    Or URL:
                  </span>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setPreviewImage(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#9B111E]"
                  />
                </div>
                {formErrors.image && <p className="text-[11px] text-red-600">{formErrors.image}</p>}
              </div>
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
              placeholder="Brief description of celebrities in this category shown on cards and listing headers..."
              className={`w-full p-3 text-xs sm:text-sm border rounded-xl outline-none ${
                formErrors.description ? "border-red-500 bg-red-50/30" : "border-gray-200 focus:border-[#9B111E]"
              }`}
            />
            {formErrors.description && <p className="mt-1 text-[11px] text-red-600">{formErrors.description}</p>}
          </div>

          {/* Display Count Label, Display Order, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Display Count Label
              </label>
              <input
                type="text"
                value={displayCount}
                onChange={(e) => setDisplayCount(e.target.value)}
                placeholder="e.g. 85+ Celebrities"
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#9B111E]"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">Marketing tag for cards</span>
            </div>

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
              <span className="text-[10px] text-gray-400 mt-0.5 block">Position in navigation</span>
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
              <span className="text-[10px] text-gray-400 mt-0.5 block">Public visibility toggle</span>
            </div>
          </div>

          {/* Modal Actions */}
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
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-bold shadow-md shadow-red-950/20 transition-all disabled:opacity-60 flex items-center gap-1.5"
            >
              <span>{isEditing ? "Save Changes" : "Save Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
