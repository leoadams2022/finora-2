// src/pages/Debts.jsx
import React, { useState } from "react";
import { Plus, Receipt, Filter, LayoutList, Maximize2 } from "lucide-react";
import { useDebts } from "../hooks/useDebts";
import { usePeopleEntities } from "../hooks/usePeopleEntities";
import { useAccounts } from "../hooks/useAccounts";
import { debtService } from "../services/debtService";
import DebtModal from "../components/debts/DebtModal";
import DebtPaymentModal from "../components/debts/DebtPaymentModal";
import DebtDetailsModal from "../components/debts/DebtDetailsModal";
import DebtFilters from "../components/debts/DebtFilters";
import DebtTable from "../components/debts/DebtTable";
import DebtCardGrid from "../components/debts/DebtCardGrid";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";
import { useLocalStorage } from "../hooks/useLocalStorage";

const Debts = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isCompactView, setIsCompactView] = useLocalStorage(
    "debt_isCompactView",
    false,
  );

  const [filters, setFilters] = useState({
    direction: "",
    personEntityId: "",
    status: "",
    accountId: "",
    startDate: "",
    dueDate: "",
    createdAt: "",
    minOriginalAmount: "",
    maxOriginalAmount: "",
    minTotalPaid: "",
    maxTotalPaid: "",
    minRemainingBalance: "",
    maxRemainingBalance: "",
  });

  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc",
  });

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState(null);
  const [debtToView, setDebtToView] = useState(null);
  const [debtForPayment, setDebtForPayment] = useState(null);
  const [debtToDelete, setDebtToDelete] = useState(null);

  const { debts, isLoading } = useDebts(filters, sortConfig);
  const { peopleEntities } = usePeopleEntities();
  const { accounts } = useAccounts();
  const { showSuccess, showError } = useToast();

  const handleSaveDebt = async (
    formData,
    newAttachments = [],
    attachmentsToDelete = [],
  ) => {
    try {
      if (debtToEdit) {
        await debtService.updateDebt(
          debtToEdit.id,
          formData,
          newAttachments,
          attachmentsToDelete,
        );
        showSuccess("Debt record updated successfully.");
      } else {
        await debtService.createDebt(formData, newAttachments);
        showSuccess("Debt recorded successfully.");
      }
      handleCloseModal();
    } catch (err) {
      showError(err.message || "Failed to save debt record.");
      throw err;
    }
  };

  const handleOpenEditModal = (debt) => {
    setDebtToEdit(debt);
    setIsDebtModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDebtModalOpen(false);
    setDebtToEdit(null);
  };

  const handleRecordPayment = async (formData) => {
    try {
      await debtService.recordDebtPayment(formData);
      showSuccess("Debt payment recorded.");
    } catch (err) {
      showError(err.message || "Failed to record payment.");
      throw err;
    }
  };

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return;
    try {
      await debtService.deleteDebt(debtToDelete.id);
      showSuccess("Debt record deleted.");
      setDebtToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete debt.");
    }
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      direction: "",
      personEntityId: "",
      status: "",
      accountId: "",
      startDate: "",
      dueDate: "",
      createdAt: "",
      minOriginalAmount: "",
      maxOriginalAmount: "",
      minTotalPaid: "",
      maxTotalPaid: "",
      minRemainingBalance: "",
      maxRemainingBalance: "",
    });
  };

  if (isLoading) return <LoadingState message="Loading debt records..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Debts & Liabilities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track money you owe (liabilities) and money owed to you (assets).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Toggle Filters Button */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition touch-manipulation min-h-10 sm:min-h-0 ${
              showFilters
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600"
            }`}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span>{showFilters ? "Hide Filters" : "Filters"}</span>
          </button>

          {/* Compact / Full Table View Toggle */}
          <button
            type="button"
            onClick={() => setIsCompactView((prev) => !prev)}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium transition touch-manipulation min-h-10 sm:min-h-0 ${
              isCompactView
                ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600"
            }`}
            title="Toggle between standard table and compact card view"
          >
            {isCompactView ? (
              <Maximize2 className="h-4 w-4 shrink-0" />
            ) : (
              <LayoutList className="h-4 w-4 shrink-0" />
            )}
            <span>{isCompactView ? "Full Table" : "Compact View"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDebtToEdit(null);
              setIsDebtModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Record Debt</span>
          </button>
        </div>
      </div>

      {/* Filter Section Component */}
      <DebtFilters
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        peopleEntities={peopleEntities}
        accounts={accounts}
      />

      {/* Debts Content Area */}
      {debts.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No debt records found"
          description="Record debts to track borrowing, lending, and payment histories."
          actionLabel="Record Debt"
          onAction={() => {
            setDebtToEdit(null);
            setIsDebtModalOpen(true);
          }}
        />
      ) : isCompactView ? (
        <DebtCardGrid
          debts={debts}
          peopleEntities={peopleEntities}
          onPay={setDebtForPayment}
          onView={setDebtToView}
          onEdit={handleOpenEditModal}
          onDelete={setDebtToDelete}
        />
      ) : (
        <DebtTable
          debts={debts}
          peopleEntities={peopleEntities}
          onSort={handleSort}
          onPay={setDebtForPayment}
          onView={setDebtToView}
          onEdit={handleOpenEditModal}
          onDelete={setDebtToDelete}
        />
      )}

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDebt}
        debtToEdit={debtToEdit}
      />

      <DebtDetailsModal
        isOpen={!!debtToView}
        onClose={() => setDebtToView(null)}
        debt={debtToView}
      />

      <DebtPaymentModal
        isOpen={!!debtForPayment}
        onClose={() => setDebtForPayment(null)}
        debt={debtForPayment}
        onSave={handleRecordPayment}
      />

      <ConfirmDialog
        isOpen={!!debtToDelete}
        onClose={() => setDebtToDelete(null)}
        onConfirm={handleDeleteDebt}
        title="Delete Debt?"
        message="Are you sure you want to delete this debt record and its payment history?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Debts;
