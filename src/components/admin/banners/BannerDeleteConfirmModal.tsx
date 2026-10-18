"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { HeroBanner } from "@/types/banner";

interface BannerDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  banner: HeroBanner | null;
  isDeleting?: boolean;
}

export const BannerDeleteConfirmModal: React.FC<BannerDeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  banner,
  isDeleting = false,
}) => {
  if (!isOpen || !banner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1.5">
          Delete Hero Banner?
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          Are you sure you want to permanently delete the banner:
          <br />
          <strong className="text-gray-900 mt-1 block font-semibold">
            &ldquo;{banner.title}&rdquo;
          </strong>
        </p>
        <p className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6">
          This banner will be immediately removed from the homepage hero carousel. If no other banners exist, the default site hero fallback will be shown.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Banner"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
