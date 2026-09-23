// src/components/transactions/LatestTransactionsCard.jsx

import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../db/database";
import { Receipt } from "lucide-react";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import { usePeopleEntities } from "../../hooks/usePeopleEntities";
import { useCurrencies } from "../../hooks/useCurrencies";
import { calculateDebtBalance } from "../../finance/debts";
import { transactionService } from "../../services/transactionService";
import { transferService } from "../../services/transferService";
import { debtService } from "../../services/debtService";
import TransactionCard from "./TransactionCard";
import DebtCard from "../debts/DebtCard";
import TransactionDetailsModal from "./TransactionDetailsModal";
import TransactionModal from "./TransactionModal";
import TransferModal from "../transfers/TransferModal";
import TransferDetailsModal from "../transfers/TransferDetailsModal";
import DebtModal from "../debts/DebtModal";
import DebtDetailsModal from "../debts/DebtDetailsModal";
import DebtPaymentModal from "../debts/DebtPaymentModal";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useToast } from "../../hooks/useToast";

const TransactionsCardsGrid = ({ transactions = [] }) => {
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const { peopleEntities = [] } = usePeopleEntities();
  const { getCurrency } = useCurrencies();
  const { showSuccess, showError } = useToast();

  // Modals state
  const [selectedTxForView, setSelectedTxForView] = useState(null);
  const [txToEdit, setTxToEdit] = useState(null);

  const [transferToView, setTransferToView] = useState(null);
  const [transferToEdit, setTransferToEdit] = useState(null);

  const [debtToView, setDebtToView] = useState(null);
  const [debtToEdit, setDebtToEdit] = useState(null);
  const [debtForPayment, setDebtForPayment] = useState(null);

  const [itemToDelete, setItemToDelete] = useState(null);

  // Extract debt IDs from transactions to fetch debt records
  const debtIds = transactions
    .filter((tx) => tx.isDebtTransaction && tx.debtId)
    .map((tx) => tx.debtId);

  // Reactively fetch matching debt records along with stats from Dexie
  const debts =
    useLiveQuery(async () => {
      if (debtIds.length === 0) return [];
      const debtRecords = await db.debts.where("id").anyOf(debtIds).toArray();

      return await Promise.all(
        debtRecords.map(async (d) => {
          const stats = await calculateDebtBalance(d.id);
          return { ...d, ...stats };
        }),
      );
    }, [JSON.stringify(debtIds)]) || [];

  // Live attachment counts per transaction
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

  // Handlers
  const handleViewDetails = async (tx) => {
    if (tx.isTransferTransaction) {
      setTransferToView(tx);
    } else if (tx.isDebtTransaction) {
      const fullDebt =
        debts.find((d) => d.id === tx.debtId) ||
        (await db.debts.get(tx.debtId));
      setDebtToView(fullDebt || tx);
    } else {
      setSelectedTxForView(tx);
    }
  };

  const handleOpenEdit = async (tx) => {
    if (tx.isTransferTransaction) {
      setTransferToEdit(tx);
    } else if (tx.isDebtTransaction) {
      const fullDebt =
        debts.find((d) => d.id === tx.debtId) ||
        (await db.debts.get(tx.debtId));
      if (fullDebt) setDebtToEdit(fullDebt);
    } else {
      setTxToEdit(tx);
    }
  };

  const handleSaveTransaction = async (formData, newFiles, deleteFiles) => {
    try {
      if (txToEdit) {
        await transactionService.updateTransaction(
          txToEdit.id,
          formData,
          newFiles,
          deleteFiles,
        );
        showSuccess("Transaction updated.");
      }
      setTxToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update transaction.");
    }
  };

  const handleSaveTransfer = async (formData, newFiles, deleteFiles) => {
    try {
      if (transferToEdit) {
        await transferService.updateTransfer(
          transferToEdit.id,
          formData,
          newFiles,
          deleteFiles,
        );
        showSuccess("Transfer updated.");
      }
      setTransferToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update transfer.");
    }
  };

  const handleSaveDebt = async (formData, newFiles, deleteFiles) => {
    try {
      if (debtToEdit) {
        await debtService.updateDebt(
          debtToEdit.id,
          formData,
          newFiles,
          deleteFiles,
        );
        showSuccess("Debt updated.");
      }
      setDebtToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update debt.");
    }
  };

  const handleRecordDebtPayment = async (formData) => {
    try {
      await debtService.recordDebtPayment(formData);
      showSuccess("Debt payment recorded.");
      setDebtForPayment(null);
    } catch (err) {
      showError(err.message || "Failed to record payment.");
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.isTransferTransaction) {
        await transferService.deleteTransfer(itemToDelete.id);
        showSuccess("Transfer deleted.");
      } else if (itemToDelete.isDebtTransaction && itemToDelete.debtId) {
        await debtService.deleteDebt(itemToDelete.debtId);
        showSuccess("Debt record deleted.");
      } else {
        await transactionService.deleteTransaction(itemToDelete.id);
        showSuccess("Transaction deleted.");
      }
      setItemToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete item.");
    }
  };

  return (
    <>
      {transactions.length === 0 ? (
        <p className="text-xs text-slate-400 italic p-4 text-center">
          No transactions recorded yet.
        </p>
      ) : (
        /* List on SM screens (<640px), Grid on MD (2 cols) and LG (3 cols) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {transactions.map((tx) => {
            const account = accounts.find((a) => a.id === tx.accountId);
            const category = categories.find((c) => c.id === tx.categoryId);
            const subcategory = subcategories.find(
              (s) => s.id === tx.subcategoryId,
            );
            const attCount =
              attachmentCounts?.[tx.id] || attachmentCounts?.[tx.debtId] || 0;

            // Debt Transaction rendering using DebtCard
            if (tx.isDebtTransaction) {
              const fullDebt = debts.find((d) => d.id === tx.debtId);
              if (!fullDebt) return null;

              const person = peopleEntities.find(
                (p) => p.id === fullDebt.personEntityId,
              );

              return (
                <DebtCard
                  key={fullDebt.id || tx.id}
                  debt={fullDebt}
                  person={person}
                  onPay={() => setDebtForPayment(fullDebt)}
                  onView={() => handleViewDetails(tx)}
                  onEdit={() => handleOpenEdit(tx)}
                  onDelete={() => setItemToDelete(tx)}
                  getCurrency={getCurrency}
                  passDebtIdKey={true}
                />
              );
            }

            // Standard Transaction rendering
            return (
              <TransactionCard
                key={tx.id}
                tx={tx}
                account={account}
                category={category}
                subcategory={subcategory}
                attachmentCount={attCount}
                getCurrency={getCurrency}
                accounts={accounts}
                onView={() => handleViewDetails(tx)}
                onEdit={() => handleOpenEdit(tx)}
                onDelete={() => setItemToDelete(tx)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedTxForView && (
        <TransactionDetailsModal
          isOpen={!!selectedTxForView}
          onClose={() => setSelectedTxForView(null)}
          transaction={selectedTxForView}
          account={accounts.find((a) => a.id === selectedTxForView.accountId)}
          category={categories.find(
            (c) => c.id === selectedTxForView.categoryId,
          )}
          subcategory={subcategories.find(
            (s) => s.id === selectedTxForView.subcategoryId,
          )}
        />
      )}

      {txToEdit && (
        <TransactionModal
          isOpen={!!txToEdit}
          onClose={() => setTxToEdit(null)}
          onSave={handleSaveTransaction}
          transactionToEdit={txToEdit}
        />
      )}

      {transferToView && (
        <TransferDetailsModal
          isOpen={!!transferToView}
          onClose={() => setTransferToView(null)}
          transfer={transferToView}
        />
      )}

      {transferToEdit && (
        <TransferModal
          isOpen={!!transferToEdit}
          onClose={() => setTransferToEdit(null)}
          onSave={handleSaveTransfer}
          transferToEdit={transferToEdit}
        />
      )}

      {debtToView && (
        <DebtDetailsModal
          isOpen={!!debtToView}
          onClose={() => setDebtToView(null)}
          debt={debtToView}
        />
      )}

      {debtToEdit && (
        <DebtModal
          isOpen={!!debtToEdit}
          onClose={() => setDebtToEdit(null)}
          onSave={handleSaveDebt}
          debtToEdit={debtToEdit}
        />
      )}

      {debtForPayment && (
        <DebtPaymentModal
          isOpen={!!debtForPayment}
          onClose={() => setDebtForPayment(null)}
          debt={debtForPayment}
          onSave={handleRecordDebtPayment}
        />
      )}

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteItem}
        title="Delete Record?"
        message="Are you sure you want to delete this record?"
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

export default TransactionsCardsGrid;
