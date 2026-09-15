// src/components/common/QuickActionModal.jsx
import React, { useState } from "react";
import { X, ArrowRightLeft, DollarSign, UserCheck } from "lucide-react";
// import { TransactionForm } from "../transactions/TransactionForm";
import { TransferForm } from "../transfers/TransferForm";
import { DebtForm } from "../debts/DebtForm";
import { transactionService } from "../../services/transactionService";
import { transferService } from "../../services/transferService";
import { debtService } from "../../services/debtService";
import { useToast } from "../../hooks/useToast";
import TransactionForm from "../transactions/TransactionForm";

const QuickActionModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("transaction"); // "transaction" | "transfer" | "debt"
  const { showSuccess } = useToast();

  if (!isOpen) return null;

  const handleSaveTransaction = async (
    formData,
    newAttachments = [],
    // eslint-disable-next-line no-unused-vars
    attachmentsToDelete = [],
  ) => {
    await transactionService.createTransaction(formData, newAttachments);
    showSuccess("Transaction recorded successfully!");
    onClose();
  };

  const handleSaveTransfer = async (
    formData,
    newAttachments = [],
    // eslint-disable-next-line no-unused-vars
    attachmentsToDelete = [],
  ) => {
    await transferService.createTransfer(formData, newAttachments);
    showSuccess("Transfer executed successfully!");
    onClose();
  };

  const handleSaveDebt = async (
    formData,
    newAttachments = [],
    // eslint-disable-next-line no-unused-vars
    attachmentsToDelete = [],
  ) => {
    await debtService.createDebt(formData, newAttachments);
    showSuccess("Debt recorded successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[99vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            Quick Action
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-3 sm:mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("transaction")}
            className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-1.5 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold transition touch-manipulation min-h-10 ${
              activeTab === "transaction"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="truncate">Transaction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transfer")}
            className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-1.5 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold transition touch-manipulation min-h-10 ${
              activeTab === "transfer"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("debt")}
            className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-1.5 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold transition touch-manipulation min-h-10 ${
              activeTab === "debt"
                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span className="truncate">Debt</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="mt-3 sm:mt-4">
          {activeTab === "transaction" && (
            <TransactionForm
              key="quick-tx"
              onSave={handleSaveTransaction}
              onClose={onClose}
            />
          )}

          {activeTab === "transfer" && (
            <TransferForm
              key="quick-trf"
              onSave={handleSaveTransfer}
              onClose={onClose}
            />
          )}

          {activeTab === "debt" && (
            <DebtForm
              key="quick-debt"
              onSave={handleSaveDebt}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionModal;
