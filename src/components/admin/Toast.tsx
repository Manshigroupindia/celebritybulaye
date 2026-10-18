"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss?: () => void;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss, onClose }) => {
  const handleClose = () => {
    if (onClose) onClose();
    if (onDismiss) onDismiss();
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 ${
          isSuccess
            ? "bg-emerald-950 text-emerald-100 border-emerald-800"
            : isError
            ? "bg-red-950 text-red-100 border-red-800"
            : "bg-gray-900 text-gray-100 border-gray-700"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-blue-400" />
          )}
        </div>
        <div className="flex-1 text-xs font-medium leading-relaxed">
          {toast.message}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
