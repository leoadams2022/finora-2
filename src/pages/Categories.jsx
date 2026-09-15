// src/pages/Categories.jsx

import React, { useState } from "react";
import {
  Plus,
  FolderTree,
  Edit2,
  Archive,
  ArchiveRestore,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { categoryService } from "../services/categoryService";
import CategoryModal from "../components/categories/CategoryModal";
import SubcategoryModal from "../components/categories/SubcategoryModal";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";

const Categories = () => {
  const [showArchived, setShowArchived] = useState(false);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  // Subcategory Modal State
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [activeParentCategory, setActiveParentCategory] = useState(null);
  const [subcategoryToEdit, setSubcategoryToEdit] = useState(null);

  const { categories, subcategories, isLoading } = useCategories(showArchived);
  const { showSuccess, showError } = useToast();

  // Category Handlers
  const handleOpenAddCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (formData) => {
    try {
      if (categoryToEdit) {
        await categoryService.updateCategory(categoryToEdit.id, formData);
        showSuccess("Category updated.");
      } else {
        await categoryService.createCategory(formData);
        showSuccess("Category created.");
      }
    } catch (err) {
      showError(err.message || "Operation failed.");
      throw err;
    }
  };

  const handleToggleArchiveCategory = async (cat) => {
    try {
      const isArchiving = cat.isActive !== false;
      await categoryService.toggleArchiveCategory(cat.id, isArchiving);
      showSuccess(
        isArchiving
          ? `Category "${cat.name}" archived.`
          : `Category "${cat.name}" restored.`,
      );
    } catch (err) {
      showError(err.message || "Action failed.");
    }
  };

  // Subcategory Handlers
  const handleOpenAddSubcategory = (parentCat) => {
    setActiveParentCategory(parentCat);
    setSubcategoryToEdit(null);
    setIsSubcategoryModalOpen(true);
  };

  const handleOpenEditSubcategory = (parentCat, sub) => {
    setActiveParentCategory(parentCat);
    setSubcategoryToEdit(sub);
    setIsSubcategoryModalOpen(true);
  };

  const handleSaveSubcategory = async (formData) => {
    try {
      if (subcategoryToEdit) {
        await categoryService.updateSubcategory(subcategoryToEdit.id, formData);
        showSuccess("Subcategory updated.");
      } else {
        await categoryService.createSubcategory(formData);
        showSuccess("Subcategory added.");
      }
    } catch (err) {
      showError(err.message || "Operation failed.");
      throw err;
    }
  };

  const handleToggleArchiveSubcategory = async (sub) => {
    try {
      const isArchiving = sub.isActive !== false;
      await categoryService.toggleArchiveSubcategory(sub.id, isArchiving);
      showSuccess(
        isArchiving
          ? `Subcategory "${sub.name}" archived.`
          : `Subcategory "${sub.name}" restored.`,
      );
    } catch (err) {
      showError(err.message || "Action failed.");
    }
  };

  if (isLoading) return <LoadingState message="Loading categories..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Categories & Subcategories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize your income and expenses into structured categories and
            subcategories.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowArchived((prev) => !prev)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-10 touch-manipulation"
          >
            {showArchived ? (
              <EyeOff className="h-4 w-4 shrink-0" />
            ) : (
              <Eye className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">
              {showArchived ? "Hide Archived" : "Show Archived"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddCategory}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition min-h-10 touch-manipulation"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">Add Category</span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="No categories found"
          description={
            showArchived
              ? "No categories exist in your database."
              : "Create your first financial category to organize transactions."
          }
          actionLabel="Add Category"
          onAction={handleOpenAddCategory}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const catSubcategories = subcategories.filter(
              (s) => s.categoryId === cat.id,
            );
            return (
              <div
                key={cat.id}
                className={`flex flex-col justify-between rounded-xl border p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4 transition ${
                  cat.isActive === false
                    ? "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-800 opacity-75"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                      <div
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-white font-bold shadow-sm"
                        style={{ backgroundColor: cat.color || "#3b82f6" }}
                      >
                        {cat.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </h3>
                        <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400 block truncate">
                          {cat.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center"
                        title="Edit Category"
                        aria-label="Edit Category"
                      >
                        <Edit2 className="h-4 w-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleArchiveCategory(cat)}
                        className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center"
                        title={
                          cat.isActive === false
                            ? "Restore Category"
                            : "Archive Category"
                        }
                        aria-label={
                          cat.isActive === false
                            ? "Restore Category"
                            : "Archive Category"
                        }
                      >
                        {cat.isActive === false ? (
                          <ArchiveRestore className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Archive className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Subcategories List */}
                  <div className="border-t border-slate-100 dark:border-slate-700/60 mt-3 pt-2.5 sm:mt-4 sm:pt-3">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="text-xs text-slate-500 font-medium shrink-0">
                        Subcategories:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddSubcategory(cat)}
                        className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline active:opacity-75 py-1 px-0.5 touch-manipulation shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 shrink-0" />
                        <span>Add Subcategory</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {catSubcategories.length === 0 ? (
                        <span className="text-xs italic text-slate-400">
                          No subcategories created yet
                        </span>
                      ) : (
                        catSubcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className={`group flex items-center space-x-1.5 rounded-md px-2 py-1 text-xs border transition max-w-full ${
                              sub.isActive === false
                                ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through"
                                : "bg-slate-100 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            <span className="truncate max-w-32.5 sm:max-w-none">
                              {sub.name}
                            </span>
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditSubcategory(cat, sub)
                                }
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 sm:opacity-60 group-hover:opacity-100 transition p-1 touch-manipulation flex items-center justify-center"
                                title="Edit Subcategory"
                                aria-label="Edit Subcategory"
                              >
                                <Edit2 className="h-3 w-3 shrink-0" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleArchiveSubcategory(sub)
                                }
                                className="text-slate-400 hover:text-amber-500 sm:opacity-60 group-hover:opacity-100 transition p-1 touch-manipulation flex items-center justify-center"
                                title={
                                  sub.isActive === false
                                    ? "Restore Subcategory"
                                    : "Archive Subcategory"
                                }
                                aria-label={
                                  sub.isActive === false
                                    ? "Restore Subcategory"
                                    : "Archive Subcategory"
                                }
                              >
                                <Archive className="h-3 w-3 shrink-0" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        categoryToEdit={categoryToEdit}
      />

      <SubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        onSave={handleSaveSubcategory}
        subcategoryToEdit={subcategoryToEdit}
        parentCategory={activeParentCategory}
      />
    </div>
  );
};

export default Categories;
