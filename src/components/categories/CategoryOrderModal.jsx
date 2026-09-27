// src/components/categories/CategoryOrderModal.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  X,
  FolderTree,
} from "lucide-react";
import { categoryService } from "../../services/categoryService";
import { useToast } from "../../hooks/useToast";

/**
 * Modal to reorder categories and their nested subcategories.
 * Changes are staged locally and committed to Dexie/IndexedDB on "Save Order".
 */
const CategoryOrderModal = ({
  isOpen,
  onClose,
  categories = [],
  subcategories = [],
}) => {
  const { showSuccess, showError } = useToast();

  // Local staged state for immediate drag responsiveness
  const [stagedCategories, setStagedCategories] = useState([]);
  const [stagedSubcategoriesMap, setStagedSubcategoriesMap] = useState({});
  const [expandedCategoryIds, setExpandedCategoryIds] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sort top-level categories by current sortOrder
      const sortedCats = [...categories].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStagedCategories(sortedCats);

      // Group and sort subcategories per category
      const subMap = {};
      sortedCats.forEach((cat) => {
        subMap[cat.id] = subcategories
          .filter((s) => s.categoryId === cat.id)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });
      setStagedSubcategoriesMap(subMap);
    }
  }, [isOpen, categories, subcategories]);

  if (!isOpen) return null;

  const toggleAccordion = (catId) => {
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Reorder Top-Level Categories locally in state
  const handleCategoryDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(stagedCategories);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setStagedCategories(reordered);
  };

  // Reorder Subcategories locally in state
  const handleSubcategoryDragEnd = (categoryId, result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const currentSubs = Array.from(stagedSubcategoriesMap[categoryId] || []);
    const [moved] = currentSubs.splice(source.index, 1);
    currentSubs.splice(destination.index, 0, moved);

    setStagedSubcategoriesMap((prev) => ({
      ...prev,
      [categoryId]: currentSubs,
    }));
  };

  // Commit all staged order changes to IndexedDB atomically
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // 1. Commit top-level category order
      const categoryIds = stagedCategories.map((cat) => cat.id);
      await categoryService.reorderCategories(categoryIds);

      // 2. Commit subcategory order per category
      for (const cat of stagedCategories) {
        const subIds = (stagedSubcategoriesMap[cat.id] || []).map(
          (sub) => sub.id,
        );
        if (subIds.length > 0) {
          await categoryService.reorderSubcategories(subIds);
        }
      }

      showSuccess("Category and subcategory orders saved.");
      onClose();
    } catch (err) {
      showError(err.message || "Failed to save reordered items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Window */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <FolderTree className="h-5 w-5 text-emerald-600 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reorder Categories & Subcategories
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
          Drag items to reorder them, expand categories to manage subcategories,
          and click <strong>Save Order</strong> to apply changes.
        </p>

        {/* Scrollable Drag List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <DragDropContext onDragEnd={handleCategoryDragEnd}>
            <Droppable droppableId="categories-modal-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {stagedCategories.map((cat, index) => {
                    const catSubs = stagedSubcategoriesMap[cat.id] || [];
                    const isExpanded = Boolean(expandedCategoryIds[cat.id]);

                    return (
                      <Draggable
                        key={cat.id}
                        draggableId={cat.id}
                        index={index}
                      >
                        {(draggableProvided, snapshot) => (
                          <div
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            style={{
                              ...draggableProvided.draggableProps.style,
                            }}
                            className={`rounded-lg border bg-white dark:bg-slate-900 transition-shadow ${
                              snapshot.isDragging
                                ? "shadow-lg ring-2 ring-emerald-500 border-transparent z-50 opacity-90"
                                : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {/* Category Row */}
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                <div
                                  {...draggableProvided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition touch-none"
                                >
                                  <GripVertical className="h-4 w-4 shrink-0" />
                                </div>

                                <div
                                  className="h-6 w-6 shrink-0 flex items-center justify-center rounded text-white text-xs font-bold"
                                  style={{
                                    backgroundColor: cat.color || "#3b82f6",
                                  }}
                                >
                                  {cat.name.charAt(0)}
                                </div>

                                <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                  {cat.name}
                                </span>
                              </div>

                              {/* Accordion Toggle */}
                              {catSubs.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleAccordion(cat.id)}
                                  className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                  <span>{catSubs.length} sub</span>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 shrink-0" />
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Subcategories Accordion Content */}
                            {isExpanded && catSubs.length > 0 && (
                              <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2.5 pl-8 space-y-1.5 rounded-b-lg">
                                <DragDropContext
                                  onDragEnd={(result) =>
                                    handleSubcategoryDragEnd(cat.id, result)
                                  }
                                >
                                  <Droppable
                                    droppableId={`subs-modal-${cat.id}`}
                                  >
                                    {(subProvided) => (
                                      <div
                                        {...subProvided.droppableProps}
                                        ref={subProvided.innerRef}
                                        className="space-y-1.5"
                                      >
                                        {catSubs.map((sub, subIdx) => (
                                          <Draggable
                                            key={sub.id}
                                            draggableId={sub.id}
                                            index={subIdx}
                                          >
                                            {(
                                              subDraggableProvided,
                                              subSnapshot,
                                            ) => (
                                              <div
                                                ref={
                                                  subDraggableProvided.innerRef
                                                }
                                                {...subDraggableProvided.draggableProps}
                                                style={{
                                                  ...subDraggableProvided
                                                    .draggableProps.style,
                                                }}
                                                className={`flex items-center space-x-2 p-2 rounded-md border text-xs bg-white dark:bg-slate-800 ${
                                                  subSnapshot.isDragging
                                                    ? "shadow-md ring-1 ring-emerald-500 z-50 opacity-90"
                                                    : "border-slate-200 dark:border-slate-700"
                                                }`}
                                              >
                                                <div
                                                  {...subDraggableProvided.dragHandleProps}
                                                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition touch-none p-0.5"
                                                >
                                                  <GripVertical className="h-3.5 w-3.5 shrink-0" />
                                                </div>
                                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                                  {sub.name}
                                                </span>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {subProvided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryOrderModal;
