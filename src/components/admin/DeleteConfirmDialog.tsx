"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  warningDetails?: string;
  subcategoriesCount?: number;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  warningDetails,
  subcategoriesCount = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">
          {title}
        </h3>

        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          Are you sure you want to permanently delete{" "}
          <strong className="text-gray-900 font-bold">&ldquo;{itemName}&rdquo;</strong>? This action cannot be undone.
        </p>

        {subcategoriesCount > 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs mb-5 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Important Warning:</strong>
              This category contains <strong>{subcategoriesCount} child subcategories</strong>. Deleting this parent category will automatically delete all attached subcategories.
            </div>
          </div>
        )}

        {warningDetails && !subcategoriesCount && (
          <p className="text-[11px] text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            {warningDetails}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-950/20 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
