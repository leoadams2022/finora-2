// src/components/ui/TagSelect.jsx

import React, { useState, useRef, useEffect } from "react";
import { Tag as TagIcon, Check, Search, X, ChevronDown } from "lucide-react";

/**
 * Filterable multi-select dropdown for tags to keep forms compact when tag count is high.
 */
export const TagSelect = ({
  label = "Tags",
  availableTags = [],
  selectedTags = [],
  onChange,
  placeholder = "Select tags...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredTags = availableTags.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  const toggleTag = (tagName) => {
    const exists = selectedTags.includes(tagName);
    const updated = exists
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onChange(updated);
  };

  const removeTag = (e, tagName) => {
    e.stopPropagation();
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Selector Trigger Button */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full min-h-10.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 flex items-center justify-between gap-2 cursor-pointer transition hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-emerald-500 touch-manipulation"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          <TagIcon className="h-4 w-4 text-slate-400 shrink-0 ml-0.5" />
          {selectedTags.length === 0 ? (
            <span className="text-xs text-slate-400 truncate">
              {placeholder}
            </span>
          ) : (
            selectedTags.map((tagName) => (
              <span
                key={tagName}
                className="inline-flex items-center space-x-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
              >
                <span>#{tagName}</span>
                <button
                  type="button"
                  onClick={(e) => removeTag(e, tagName)}
                  className="hover:text-rose-500 dark:hover:text-rose-400 rounded transition p-0.5"
                  aria-label={`Remove tag ${tagName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {selectedTags.length > 0 && (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
              {selectedTags.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Searchable Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl flex flex-col">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700/80 sticky top-0 bg-white dark:bg-slate-800">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tags..."
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 py-1.5 pl-8 pr-7 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List Options */}
          <div className="overflow-y-auto p-1 divide-y divide-slate-50 dark:divide-slate-700/30">
            {filteredTags.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 italic">
                No tags found
              </div>
            ) : (
              filteredTags.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className="w-full flex items-center justify-between p-2 text-xs text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition touch-manipulation min-h-9.5"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                      #{t.name}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelect;
