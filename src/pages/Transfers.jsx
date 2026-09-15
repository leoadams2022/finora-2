// src/pages/Transfers.jsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { Plus, ArrowUpDown, LayoutList, Maximize2 } from "lucide-react";
import { useTransfers } from "../hooks/useTransfers";
import { useAccounts } from "../hooks/useAccounts";
import { useCurrencies } from "../hooks/useCurrencies";
import { transferService } from "../services/transferService";
import TransferModal from "../components/transfers/TransferModal";
import TransferDetailsModal from "../components/transfers/TransferDetailsModal";
import TransferTable from "../components/transfers/TransferTable";
import TransferCardGrid from "../components/transfers/TransferCardGrid";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../hooks/useToast";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const Transfers = () => {
  const [isCompactView, setIsCompactView] = useLocalStorage(
    "transfers_isCompactView",
    false,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferToEdit, setTransferToEdit] = useState(null);
  const [transferToView, setTransferToView] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);

  const { transfers, isLoading } = useTransfers();
  const { accounts } = useAccounts();
  const { getCurrency } = useCurrencies();
  const { showSuccess, showError } = useToast();

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

  const handleSaveTransfer = async (
    formData,
    newAttachments = [],
    attachmentsToDelete = [],
  ) => {
    try {
      if (transferToEdit) {
        await transferService.updateTransfer(
          transferToEdit.id,
          formData,
          newAttachments,
          attachmentsToDelete,
        );
        showSuccess("Transfer updated successfully.");
      } else {
        await transferService.createTransfer(formData, newAttachments);
        showSuccess("Money transfer completed successfully.");
      }
      handleCloseModal();
    } catch (err) {
      showError(err.message || "Transfer operation failed.");
      throw err;
    }
  };

  const handleOpenEditModal = (trf) => {
    setTransferToEdit(trf);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTransferToEdit(null);
  };

  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return;
    try {
      await transferService.deleteTransfer(transferToDelete.id);
      showSuccess("Transfer record deleted.");
      setTransferToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete transfer.");
    }
  };

  if (isLoading) return <LoadingState message="Loading transfers..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span>Transfers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Move funds between your accounts (Same-currency or Cross-currency
            transfers).
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* View Switcher Button */}
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
              setTransferToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Transfers List */}
      {transfers.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="No transfers recorded"
          description="Transfer money between your bank accounts, savings, or cash wallets."
          actionLabel="New Transfer"
          onAction={() => {
            setTransferToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : isCompactView ? (
        <TransferCardGrid
          transfers={transfers}
          accounts={accounts}
          attachmentCounts={attachmentCounts}
          getCurrency={getCurrency}
          onView={setTransferToView}
          onEdit={handleOpenEditModal}
          onDelete={setTransferToDelete}
        />
      ) : (
        <TransferTable
          transfers={transfers}
          accounts={accounts}
          attachmentCounts={attachmentCounts}
          onView={setTransferToView}
          onEdit={handleOpenEditModal}
          onDelete={setTransferToDelete}
        />
      )}

      {/* Modals */}
      <TransferModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTransfer}
        transferToEdit={transferToEdit}
      />

      <TransferDetailsModal
        isOpen={!!transferToView}
        onClose={() => setTransferToView(null)}
        transfer={transferToView}
      />

      <ConfirmDialog
        isOpen={!!transferToDelete}
        onClose={() => setTransferToDelete(null)}
        onConfirm={handleDeleteTransfer}
        title="Delete Transfer?"
        message="Are you sure you want to delete this transfer? Source and destination balances will be recalculated."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Transfers;
