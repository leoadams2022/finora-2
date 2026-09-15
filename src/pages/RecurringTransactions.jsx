// src/pages/RecurringTransactions.jsx

import React, { useState } from "react";
import {
  RefreshCw,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { useRecurringTransactions } from "../hooks/useRecurringTransactions";
import { recurringService } from "../services/recurringService";
import { useToast } from "../hooks/useToast";
import RecurringModal from "../components/recurring/RecurringModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

export const RecurringTransactions = () => {
  const { recurringTransactions, isLoading } = useRecurringTransactions();
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenModal = (rule = null) => {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleProcessDue = async () => {
    setIsProcessing(true);
    try {
      const created = await recurringService.processDueRecurringTransactions();
      showSuccess(
        `Processed due transactions. ${created.length} new transactions generated.`,
      );
    } catch (err) {
      showError(err.message || "Failed to process recurring transactions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (rule) => {
    try {
      const newStatus = rule.status === "active" ? "paused" : "active";
      await recurringService.updateRecurringTransaction(rule.id, {
        status: newStatus,
      });
      showSuccess(`Rule "${rule.name}" is now ${newStatus}.`);
    } catch (err) {
      showError(err.message || "Failed to toggle rule status.");
    }
  };

  const handleDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await recurringService.deleteRecurringTransaction(ruleToDelete.id);
      showSuccess(`Rule "${ruleToDelete.name}" deleted.`);
      setRuleToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete rule.");
    }
  };

  if (isLoading) return <LoadingState message="Loading recurring rules..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 sm:space-x-2.5">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span>Recurring Transactions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Automate recurring bills, subscriptions, and regular income.
          </p>
        </div>

        <div className="flex flex-col gap-2  space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleProcessDue}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition disabled:opacity-50 min-h-10 sm:min-h-0 touch-manipulation"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              {isProcessing ? "Processing..." : "Process Due Now"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition min-h-10 sm:min-h-0 touch-manipulation shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">Add Recurring Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Grid / Empty State */}
      {recurringTransactions.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No recurring rules configured"
          description="Add rules for your monthly subscriptions, rent, or recurring salary."
          actionLabel="Add Recurring Rule"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {recurringTransactions.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4 transition hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {rule.name}
                    </h3>
                    <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 capitalize block truncate">
                      {rule.frequency} • {rule.type}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider shrink-0 ${
                      rule.status === "active"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                <div className="border-t border-b border-slate-100 dark:border-slate-700/60 py-2.5 sm:py-3 flex items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-medium block">
                      Amount
                    </span>
                    <span className="font-bold font-mono text-xs sm:text-sm text-slate-900 dark:text-white">
                      {rule.currency} {rule.amount?.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-medium block">
                      Next Due
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {rule.nextOccurrence}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(rule)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700/50 p-1.5 rounded-lg transition touch-manipulation min-h-9"
                >
                  {rule.status === "active" ? (
                    <>
                      <Pause className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(rule)}
                    className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Edit Rule"
                    aria-label="Edit Rule"
                  >
                    <Edit2 className="h-4 w-4 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleToDelete(rule)}
                    className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Delete Rule"
                    aria-label="Delete Rule"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Components */}
      {isModalOpen && (
        <RecurringModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ruleToEdit={ruleToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Recurring Rule?"
        message={`Are you sure you want to delete "${ruleToDelete?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default RecurringTransactions;
