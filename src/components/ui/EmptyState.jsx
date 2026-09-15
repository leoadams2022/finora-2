// src/components/ui/EmptyState.jsx

import React from "react";
import { FolderOpen } from "lucide-react";

/**
 * Reusable EmptyState Component for displaying fallback state UI across mobile and desktop interfaces.
 *
 * @param {object} props
 * @param {React.ElementType} [props.icon] - Lucide icon component (defaults to FolderOpen)
 * @param {string} [props.title] - Main empty state heading
 * @param {string} [props.description] - Subtext explanation
 * @param {string} [props.actionLabel] - Button label text
 * @param {function} [props.onAction] - Button click handler
 * @param {React.ReactNode} [props.children] - Custom action elements or extra content
 */
const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "No data available",
  description = "There are no records to display at this time.",
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="flex min-h-55 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 p-6 sm:p-8 text-center backdrop-blur-sm">
      <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 mb-2.5 sm:mb-3 shrink-0">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
      </div>

      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-xs sm:max-w-sm text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-normal">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-3.5 sm:mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2.5 sm:py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0"
          >
            <span>{actionLabel}</span>
          </button>
        </div>
      )}

      {children && <div className="mt-3.5 sm:mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
