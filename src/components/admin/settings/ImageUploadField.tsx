"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { uploadMediaFile } from "@/services/mediaService";

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  recommendedSize?: string;
  prefix?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  description,
  value,
  onChange,
  recommendedSize,
  prefix = "settings",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB for settings assets)
    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB size limit.");
      return;
    }

    // Validate mime
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!validMimes.includes(file.type)) {
      setError("Supported formats: JPG, PNG, WEBP, SVG, ICO.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadMediaFile(file, {
        presetType: "general",
        prefix,
        onProgress: (p) => setUploadProgress(p),
      });
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setError(result.error || "Upload failed.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading file.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-800">{label}</label>
        {recommendedSize && (
          <span className="text-[11px] text-gray-400 font-normal">
            Rec: {recommendedSize}
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-gray-500">{description}</p>}

      {/* Preview Area */}
      {value ? (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              <Image
                src={value}
                alt={label}
                fill
                sizes="64px"
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate max-w-xs sm:max-w-md">
                {value}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block mt-1">
                Active Asset
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shadow-xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove Asset"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div className="rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/60 p-4 transition-colors">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-700">
                  No image selected
                </p>
                <p className="text-[11px] text-gray-400">
                  Upload file (PNG, JPG, SVG up to 5MB) or enter URL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#9B111E] hover:bg-[#740D16] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-xs transition-colors"
                title="Enter external image URL"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional Direct URL Input */}
          {showUrlInput && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/asset.png"
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
              >
                Set
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/x-icon"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
