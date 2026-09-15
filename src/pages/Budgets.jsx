// src/pages/Budgets.jsx

import React, { useState } from "react";
import { Plus, PiggyBank } from "lucide-react";
import { useBudgets } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { budgetService } from "../services/budgetService";
import BudgetCard from "../components/budgets/BudgetCard";
import BudgetModal from "../components/budgets/BudgetModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";

export const Budgets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const { budgets, isLoading } = useBudgets();
  const { categories } = useCategories();
  const { showSuccess, showError } = useToast();

  const handleOpenAdd = () => {
    setBudgetToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (formData) => {
    try {
      if (budgetToEdit) {
        await budgetService.updateBudget(budgetToEdit.id, formData);
        showSuccess("Budget updated.");
      } else {
        await budgetService.createBudget(formData);
        showSuccess("Budget created.");
      }
      setIsModalOpen(false);
    } catch (err) {
      showError(err.message || "Failed to save budget.");
      throw err;
    }
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    try {
      await budgetService.deleteBudget(budgetToDelete.id);
      showSuccess("Budget deleted.");
      setBudgetToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete budget.");
    }
  };

  if (isLoading) return <LoadingState message="Loading budgets..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set spending targets and track your expense limits with optional
            rollover capabilities.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budget Grid / Empty State */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets configured"
          description="Create spending limits for categories or tags to manage your expenses effectively."
          actionLabel="Create Budget"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {budgets.map((budget) => {
            const category = categories.find((c) => c.id === budget.categoryId);

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                category={category}
                onEdit={handleOpenEdit}
                onDelete={setBudgetToDelete}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        budgetToEdit={budgetToEdit}
      />

      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={handleDeleteBudget}
        title="Delete Budget?"
        message="Are you sure you want to delete this budget limit?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Budgets;
