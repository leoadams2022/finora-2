// src/pages/Tags.jsx

import React, { useState } from "react";
import { Tag as TagIcon, Plus, Trash2 } from "lucide-react";
import { useTags } from "../hooks/useTags";
import { tagService } from "../services/tagService";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";

export const Tags = () => {
  const [newTagName, setNewTagName] = useState("");
  const [tagToDelete, setTagToDelete] = useState(null);
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
          <span>Tags</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Flexible labels to tag transactions across categories (e.g. #Vacation,
          #Work).
        </p>
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
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center space-x-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 shadow-sm text-xs sm:text-sm text-slate-800 dark:text-slate-200 min-h-9 max-w-full"
            >
              <TagIcon className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-semibold truncate max-w-45 sm:max-w-xs">
                #{tag.name}
              </span>
              <button
                type="button"
                onClick={() => setTagToDelete(tag)}
                className="ml-1.5 p-1 rounded text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-8 min-h-9 flex items-center justify-center shrink-0"
                title="Delete Tag"
                aria-label="Delete Tag"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={handleDeleteTag}
        title="Delete Tag?"
        message={`Are you sure you want to delete tag "#${tagToDelete?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Tags;
