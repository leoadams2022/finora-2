// src/components/ui/ConfirmDialog.jsx
import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * Reusable Confirmation Dialog component for destructive/critical user actions.
 * Features responsive mobile bottom-sheet positioning and touch-optimized action targets.
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone. Please confirm to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Variant-specific styles
  const variantStyles = {
    danger: {
      iconBg: "bg-rose-100 dark:bg-rose-950/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      confirmBtn:
        "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500/50 active:bg-rose-700",
    },
    warning: {
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      confirmBtn:
        "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/50 active:bg-amber-700",
    },
    info: {
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      confirmBtn:
        "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500/50 active:bg-emerald-700",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Dialog Container / Mobile Bottom Sheet */}
      <div
        className="relative z-10 w-full max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl transition-all dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 active:bg-slate-200 dark:active:bg-slate-600 disabled:opacity-50 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5 shrink-0" />
        </button>

        <div className="flex items-start space-x-3.5 sm:space-x-4 pt-1 sm:pt-0">
          {/* Icon Badge */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${currentVariant.iconBg}`}
          >
            <AlertTriangle
              className={`h-5 w-5 ${currentVariant.iconColor} shrink-0`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 pr-6 sm:pr-4">
            <h3
              id="confirm-modal-title"
              className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-snug"
            >
              {title}
            </h3>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-600 active:bg-slate-100 dark:active:bg-slate-600 disabled:opacity-50 transition min-h-10 touch-manipulation"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto flex items-center justify-center rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition min-h-10 touch-manipulation ${currentVariant.confirmBtn}`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
