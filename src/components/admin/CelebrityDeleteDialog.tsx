"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Celebrity } from "@/types";

interface CelebrityDeleteDialogProps {
  isOpen: boolean;
  celebrity: Celebrity | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const CelebrityDeleteDialog: React.FC<CelebrityDeleteDialogProps> = ({
  isOpen,
  celebrity,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !celebrity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100/80 text-red-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2">
          <h3 className="text-lg font-bold text-gray-900 font-serif">
            Delete Celebrity Profile?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 font-semibold">{celebrity.name}</strong> (
            {celebrity.category})? This will remove the profile from directory listings and booking searches.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete Profile"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
