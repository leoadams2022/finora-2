// src/pages/Tags.jsx

import React, { useState } from "react";
import {
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useTags } from "../hooks/useTags";
import { tagService } from "../services/tagService";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import TagOrderModal from "../components/tags/TagOrderModal";
import { useToast } from "../hooks/useToast";

export const Tags = () => {
  const [newTagName, setNewTagName] = useState("");
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Tag Editing State
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState("");

  const { tags, isLoading } = useTags();
  const { showSuccess, showError } = useToast();

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    try {
      await tagService.createTag(newTagName);
      setNewTagName("");
      showSuccess("Tag added successfully.");
    } catch (err) {
      showError(err.message || "Failed to create tag.");
    }
  };

  const handleStartEdit = (tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditName("");
  };

  const handleSaveEdit = async (id) => {
    try {
      await tagService.updateTag(id, editName);
      showSuccess("Tag updated successfully.");
      handleCancelEdit();
    } catch (err) {
      showError(err.message || "Failed to update tag.");
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    try {
      await tagService.deleteTag(tagToDelete.id);
      showSuccess(`Tag "#${tagToDelete.name}" deleted.`);
      setTagToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete tag.");
    }
  };

  if (isLoading) return <LoadingState message="Loading tags..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span>Tags</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Flexible labels to tag transactions across categories (e.g.
            #Vacation, #Work).
          </p>
        </div>

        {tags.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOrderModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
          >
            <ArrowUpDown className="h-4 w-4 shrink-0" />
            <span>Reorder</span>
          </button>
        )}
      </div>

      {/* Quick Add Tag Form */}
      <form
        onSubmit={handleCreateTag}
        className="flex flex-col sm:flex-row max-w-md items-stretch sm:items-center gap-2.5 sm:gap-3"
      >
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="New tag name (e.g. Travel)"
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
        />
        <button
          type="submit"
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10.5 shrink-0 shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Tag</span>
        </button>
      </form>

      {/* Tag List */}
      {tags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No tags created"
          description="Tags allow you to quickly group transactions for reporting and filtering."
        />
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tags.map((tag) => {
            const isEditingThis = editingTag?.id === tag.id;

            return (
              <div
                key={tag.id}
                className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm text-xs sm:text-sm text-slate-800 dark:text-slate-200 min-h-9 max-w-full"
              >
                {isEditingThis ? (
                  /* Inline Edit Mode */
                  <div className="flex items-center space-x-1.5">
                    <span className="text-emerald-500 font-bold">#</span>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(tag.id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 w-28"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(tag.id)}
                      className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-600 transition"
                      title="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Normal View Mode */
                  <>
                    <TagIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold truncate max-w-45 sm:max-w-xs">
                      #{tag.name}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0 ml-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tag)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition touch-manipulation flex items-center justify-center"
                        title="Edit Tag"
                        aria-label="Edit Tag"
                      >
                        <Edit2 className="h-3.5 w-3.5 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setTagToDelete(tag)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition touch-manipulation flex items-center justify-center"
                        title="Delete Tag"
                        aria-label="Delete Tag"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDeleteTag}
        title="Delete Tag?"
        message={`Are you sure you want to delete tag "#${tagToDelete?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Reorder Modal */}
      <TagOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        tags={tags}
      />
    </div>
  );
};

export default Tags;
