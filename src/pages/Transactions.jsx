// src/pages/Transactions.jsx

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import {
  Plus,
  ArrowRightLeft,
  Filter,
  LayoutList,
  Maximize2,
} from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { useTags } from "../hooks/useTags";
import { transactionService } from "../services/transactionService";
import { transferService } from "../services/transferService";
import { debtService } from "../services/debtService";
import TransactionModal from "../components/transactions/TransactionModal";
import TransactionDetailsModal from "../components/transactions/TransactionDetailsModal";
import TransferModal from "../components/transfers/TransferModal";
import TransferDetailsModal from "../components/transfers/TransferDetailsModal";
import DebtModal from "../components/debts/DebtModal";
import DebtDetailsModal from "../components/debts/DebtDetailsModal";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionTable from "../components/transactions/TransactionTable";
import TransactionCardGrid from "../components/transactions/TransactionCardGrid";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";
import { getPresetDateRange } from "../utils/dates";
import { useCurrencies } from "../hooks/useCurrencies";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Transactions = () => {
  // UI Controls State
  const [showFilters, setShowFilters] = useState(false);
  const [isCompactView, setIsCompactView] = useLocalStorage(
    "transaction_isCompactView",
    false,
  );

  // Filter State
  const [datePreset, setDatePreset] = useState("all");
  const [filters, setFilters] = useState({
    accountId: "",
    type: "",
    categoryId: "",
    subcategoryId: "",
    tag: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  // Transaction Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);
  const [selectedTxForView, setSelectedTxForView] = useState(null);

  // Transfer Modals
  const [transferToView, setTransferToView] = useState(null);
  const [transferToEdit, setTransferToEdit] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Debt Modals
  const [debtToView, setDebtToView] = useState(null);
  const [debtToEdit, setDebtToEdit] = useState(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState(null);

  const { transactions, isLoading } = useTransactions(filters, sortConfig);
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const { tags } = useTags();
  const { showSuccess, showError } = useToast();

  const { getCurrency, isLoading: currenciesisLoading } = useCurrencies();

  const attachmentCounts = useLiveQuery(
    async () => {
      const list = await db.attachments.toArray();
      const map = {};
      for (const att of list) {
        map[att.transactionId] = (map[att.transactionId] || 0) + 1;
      }
      return map;
    },
    [],
    {},
  );

  const activeSubcategories = subcategories.filter(
    (s) => s.categoryId === filters.categoryId,
  );

  const handleOpenAdd = () => {
    setTransactionToEdit(null);
    setIsModalOpen(true);
  };

  // Action Dispatcher for Viewing Details based on Type
  const handleViewDetails = async (tx) => {
    if (tx.isTransferTransaction) {
      setTransferToView(tx);
    } else if (tx.isDebtTransaction) {
      const fullDebt = await db.debts.get(tx.debtId);
      setDebtToView(fullDebt || tx);
    } else {
      setSelectedTxForView(tx);
    }
  };

  // Action Dispatcher for Editing based on Type
  const handleOpenEdit = async (tx) => {
    if (tx.isTransferTransaction) {
      setTransferToEdit(tx);
      setIsTransferModalOpen(true);
    } else if (tx.isDebtTransaction) {
      const fullDebt = await db.debts.get(tx.debtId);
      if (fullDebt) {
        setDebtToEdit(fullDebt);
        setIsDebtModalOpen(true);
      }
    } else {
      setTransactionToEdit(tx);
      setIsModalOpen(true);
    }
  };

  // Save Transaction
  const handleSaveTransaction = async (
    formData,
    newAttachments = [],
    attachmentsToDelete = [],
  ) => {
    try {
      if (transactionToEdit) {
        await transactionService.updateTransaction(
          transactionToEdit.id,
          formData,
          newAttachments,
          attachmentsToDelete,
        );
        showSuccess("Transaction updated.");
      } else {
        await transactionService.createTransaction(formData, newAttachments);
        showSuccess("Transaction recorded.");
      }
      setIsModalOpen(false);
      setTransactionToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to save transaction.");
      throw err;
    }
  };

  // Save Transfer
  const handleSaveTransfer = async (
    formData,
    newAttachments = [],
    attachmentsToDelete = [],
  ) => {
    try {
      await transferService.updateTransfer(
        transferToEdit.id,
        formData,
        newAttachments,
        attachmentsToDelete,
      );
      showSuccess("Transfer updated.");
      setIsTransferModalOpen(false);
      setTransferToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update transfer.");
      throw err;
    }
  };

  // Save Debt
  const handleSaveDebt = async (
    formData,
    newAttachments = [],
    attachmentsToDelete = [],
  ) => {
    try {
      await debtService.updateDebt(
        debtToEdit.id,
        formData,
        newAttachments,
        attachmentsToDelete,
      );
      showSuccess("Debt updated.");
      setIsDebtModalOpen(false);
      setDebtToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update debt.");
      throw err;
    }
  };

  // Action Dispatcher for Deleting based on Type
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.isTransferTransaction) {
        await transferService.deleteTransfer(itemToDelete.id);
        showSuccess("Transfer deleted.");
      } else if (itemToDelete.isDebtTransaction && itemToDelete.debtId) {
        await debtService.deleteDebt(itemToDelete.debtId);
        showSuccess("Debt record and associated transactions deleted.");
      } else {
        await transactionService.deleteTransaction(itemToDelete.id);
        showSuccess("Transaction deleted.");
      }
      setItemToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete record.");
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

  const handleDatePresetChange = (presetKey) => {
    setDatePreset(presetKey);
    if (presetKey === "all" || presetKey === "custom") {
      if (presetKey === "all") {
        setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      }
      return;
    }
    const { startDate, endDate } = getPresetDateRange(presetKey);
    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };

  const resetFilters = () => {
    setDatePreset("all");
    setFilters({
      accountId: "",
      type: "",
      categoryId: "",
      subcategoryId: "",
      tag: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  if (isLoading || currenciesisLoading)
    return <LoadingState message="Loading transactions..." />;

  const activeAccount = selectedTxForView
    ? accounts.find((a) => a.id === selectedTxForView.accountId)
    : null;
  const activeCategory = selectedTxForView
    ? categories.find((c) => c.id === selectedTxForView.categoryId)
    : null;
  const activeSubcategory = selectedTxForView
    ? subcategories.find((s) => s.id === selectedTxForView.subcategoryId)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage your recorded financial expenses, income, refunds,
            transfers, and debts.
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

          {/* Compact View Switcher */}
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

          {/* Add Transaction Primary CTA */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Toggleable Filter Bar Component */}
      {showFilters && (
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          datePreset={datePreset}
          onDatePresetChange={handleDatePresetChange}
          accounts={accounts}
          categories={categories}
          activeSubcategories={activeSubcategories}
          tags={tags}
        />
      )}

      {/* Main Content Area: Table View vs Compact Card View */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No transactions found"
          description="Try adjusting your active filters or add a new transaction."
          actionLabel="Add Transaction"
          onAction={handleOpenAdd}
        />
      ) : isCompactView ? (
        <TransactionCardGrid
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          subcategories={subcategories}
          attachmentCounts={attachmentCounts}
          getCurrency={getCurrency}
          onView={handleViewDetails}
          onEdit={handleOpenEdit}
          onDelete={setItemToDelete}
        />
      ) : (
        <TransactionTable
          transactions={transactions}
          accounts={accounts}
          categories={categories}
          subcategories={subcategories}
          attachmentCounts={attachmentCounts}
          getCurrency={getCurrency}
          onSort={handleSort}
          onView={handleViewDetails}
          onEdit={handleOpenEdit}
          onDelete={setItemToDelete}
        />
      )}

      {/* Transaction Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
      />

      <TransactionDetailsModal
        isOpen={!!selectedTxForView}
        onClose={() => setSelectedTxForView(null)}
        transaction={selectedTxForView}
        account={activeAccount}
        category={activeCategory}
        subcategory={activeSubcategory}
      />

      {/* Transfer Modals */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferToEdit(null);
        }}
        onSave={handleSaveTransfer}
        transferToEdit={transferToEdit}
      />

      <TransferDetailsModal
        isOpen={!!transferToView}
        onClose={() => setTransferToView(null)}
        transfer={transferToView}
      />

      {/* Debt Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setDebtToEdit(null);
        }}
        onSave={handleSaveDebt}
        debtToEdit={debtToEdit}
      />

      <DebtDetailsModal
        isOpen={!!debtToView}
        onClose={() => setDebtToView(null)}
        debt={debtToView}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Delete Record?"
        message="Are you sure you want to delete this record? Associated balances will be recalculated."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Transactions;
