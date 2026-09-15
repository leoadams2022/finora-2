// src/components/transactions/TagTooltip.jsx
import React, { useState } from "react";
import { Tag as TagIcon } from "lucide-react";

const TagTooltip = ({ tags = [] }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!tags || tags.length === 0) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        className="flex items-center space-x-1 cursor-pointer rounded-lg bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-900 transition touch-manipulation min-h-8 sm:min-h-0"
        aria-label={`View ${tags.length} tags`}
      >
        <TagIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">{tags.length}</span>
      </button>

      {isVisible && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-slate-700">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium text-emerald-300"
              >
                #{t}
              </span>
            ))}
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
        </div>
      )}
    </div>
  );
};

export default TagTooltip;
