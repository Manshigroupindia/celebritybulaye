"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, Link as LinkIcon, Smartphone, Monitor } from "lucide-react";
import { uploadMediaFile } from "@/services/mediaService";

interface BannerImageUploadFieldProps {
  label: string;
  description?: string;
  value?: string;
  onChange: (url: string) => void;
  recommendedSize?: string;
  isMobile?: boolean;
}

export const BannerImageUploadField: React.FC<BannerImageUploadFieldProps> = ({
  label,
  description,
  value = "",
  onChange,
  recommendedSize = "1920x800 px (16:9)",
  isMobile = false,
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

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB size limit.");
      return;
    }

    // Validate mime
    const validMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validMimes.includes(file.type)) {
      setError("Supported formats: JPG, JPEG, PNG, WebP.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadMediaFile(file, {
        presetType: "banners",
        prefix: isMobile ? "banner-mob" : "banner-desk",
        onProgress: (percent) => setUploadProgress(percent),
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
        <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
          {isMobile ? (
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span>{label}</span>
        </label>
        {recommendedSize && (
          <span className="text-[11px] text-gray-400 font-normal">
            Rec: {recommendedSize}
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-gray-500 leading-tight">{description}</p>}

      {/* Active Preview */}
      {value ? (
        <div className="relative rounded-2xl border border-gray-200 bg-gray-900 overflow-hidden shadow-xs group">
          <div
            className={`relative w-full ${
              isMobile ? "aspect-4/3 sm:aspect-16/9 max-h-48" : "aspect-21/9 sm:aspect-16/7 max-h-56"
            } bg-gray-950`}
          >
            <Image
              src={value}
              alt={label}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover object-center"
              unoptimized
            />
            {/* Cinematic Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Bottom info badge */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs truncate max-w-[240px]">
                {value}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500 font-medium truncate">
              {isMobile ? "Mobile display image ready" : "Desktop banner image ready"}
            </span>

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
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone */
        <div className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50/60 p-4 sm:p-5 transition-colors">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs ${
                  isMobile ? "text-purple-600" : "text-[#9B111E]"
                }`}
              >
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-gray-800">
                  {isMobile ? "No mobile image uploaded" : "No desktop image uploaded"}
                </p>
                <p className="text-[11px] text-gray-400">
                  Upload JPG, PNG, WebP up to 10MB or enter image URL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 ${
                  isMobile
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-[#9B111E] hover:bg-[#740D16]"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading {uploadProgress > 0 ? `${uploadProgress}%` : "..."}</span>
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
                className="px-2.5 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-xs transition-colors"
                title="Paste image URL"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* URL Input */}
          {showUrlInput && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#9B111E] outline-none"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
              >
                Set URL
              </button>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
