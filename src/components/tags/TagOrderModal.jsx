// src/components/tags/TagOrderModal.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Tag as TagIcon } from "lucide-react";
import { tagService } from "../../services/tagService";
import { useToast } from "../../hooks/useToast";

/**
 * Modal to reorder tags via a 1D sortable list.
 * Staged changes are saved to Dexie/IndexedDB upon clicking "Save Order".
 */
const TagOrderModal = ({ isOpen, onClose, tags = [] }) => {
  const { showSuccess, showError } = useToast();

  const [stagedTags, setStagedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sort tags by current sortOrder
      const sorted = [...tags].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStagedTags(sorted);
    }
  }, [isOpen, tags]);

  if (!isOpen) return null;

  // Handle local state reordering on drag end
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(stagedTags);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setStagedTags(reordered);
  };

  // Commit changes to IndexedDB
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const orderedIds = stagedTags.map((tag) => tag.id);
      await tagService.reorderTags(orderedIds);
      showSuccess("Tag order saved successfully.");
      onClose();
    } catch (err) {
      showError(err.message || "Failed to save tag order.");
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

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <TagIcon className="h-5 w-5 text-emerald-600 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reorder Tags
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
          Drag tags to change their display order, then click{" "}
          <strong>Save Order</strong>.
        </p>

        {/* Scrollable Reorder Area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tags-modal-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {stagedTags.map((tag, index) => (
                    <Draggable key={tag.id} draggableId={tag.id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          style={{
                            ...draggableProvided.draggableProps.style,
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 transition-shadow ${
                            snapshot.isDragging
                              ? "shadow-lg ring-2 ring-emerald-500 border-transparent z-50 opacity-90"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {/* Drag Handle */}
                            <div
                              {...draggableProvided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition touch-none"
                            >
                              <GripVertical className="h-4 w-4 shrink-0" />
                            </div>

                            <TagIcon className="h-4 w-4 text-emerald-500 shrink-0" />

                            <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              #{tag.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Footer Actions */}
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

export default TagOrderModal;
