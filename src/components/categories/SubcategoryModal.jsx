import React, { useState } from "react";
import { X } from "lucide-react";

const SubcategoryForm = ({
  subcategoryToEdit,
  categoryId,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState(() => ({
    name: subcategoryToEdit?.name || "",
    categoryId: categoryId || subcategoryToEdit?.categoryId || "",
  }));

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save subcategory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 sm:mt-4 space-y-3.5 sm:space-y-4"
    >
      {error && (
        <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
          Subcategory Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Fast Food, Groceries, Fuel"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-10 touch-manipulation"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition min-h-10 touch-manipulation shadow-sm"
        >
          {isSubmitting
            ? "Saving..."
            : subcategoryToEdit
              ? "Save Changes"
              : "Create Subcategory"}
        </button>
      </div>
    </form>
  );
};

const SubcategoryModal = ({
  isOpen,
  onClose,
  onSave,
  subcategoryToEdit = null,
  parentCategory = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              {subcategoryToEdit ? "Edit Subcategory" : "Add Subcategory"}
            </h3>
            {parentCategory && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Under category:{" "}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {parentCategory.name}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <SubcategoryForm
          key={
            subcategoryToEdit
              ? subcategoryToEdit.id
              : `new-sub-${parentCategory?.id}`
          }
          subcategoryToEdit={subcategoryToEdit}
          categoryId={parentCategory?.id}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default SubcategoryModal;
