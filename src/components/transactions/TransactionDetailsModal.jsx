// src/components/transactions/TransactionDetailsModal.jsx

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  X,
  Calendar,
  Wallet,
  FolderTree,
  Tag as TagIcon,
  Receipt,
  Clock,
  Info,
  Paperclip,
} from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";
import { attachmentService } from "../../services/attachmentService";
import AttachmentItem from "../common/AttachmentItem";

const TransactionDetailsModal = ({
  isOpen,
  onClose,
  transaction,
  account,
  category,
  subcategory,
}) => {
  // Fetch attached files for this transaction reactively from Dexie
  const attachments = useLiveQuery(
    async () => {
      if (!transaction?.id && !transaction?.debtId) return [];
      const attachmentsByTransactionId =
        await attachmentService.getAttachmentsByEntity(transaction.id);
      const attachmentsByDebtId =
        await attachmentService.getAttachmentsByEntity(transaction.debtId);
      return [...attachmentsByTransactionId, ...attachmentsByDebtId];
    },
    [transaction?.id, transaction?.debtId],
    [],
  );

  if (!isOpen || !transaction) return null;

  const isExpense = transaction.type === "expense";
  const isIncome = transaction.type === "income";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ${
                isExpense
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  : isIncome
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              }`}
            >
              {transaction.type}
            </span>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
              Transaction Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount Overview Banner */}
        <div className="mt-4 sm:mt-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 sm:p-4 border border-slate-100 dark:border-slate-700/60 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Account Impact
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={isExpense ? -transaction.totalImpact : transaction.amount}
              currency={transaction.currency}
              colorize
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            />
          </div>
          {transaction.feeAmount > 0 && (
            <p className="mt-1 text-xs text-slate-400">
              Includes{" "}
              <MoneyDisplay
                amount={transaction.feeAmount}
                currency={transaction.currency}
              />{" "}
              payment fee
            </p>
          )}
        </div>

        {/* Details Grid */}
        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-xs sm:text-sm">
          {/* Date & Time */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Date & Time</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-white truncate text-right">
              {transaction.date} {transaction.time && `at ${transaction.time}`}
            </span>
          </div>

          {/* Account */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
              <Wallet className="h-4 w-4 shrink-0" />
              <span>Account</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-white truncate text-right">
              {account?.name || "Unknown Account"} ({transaction.currency})
            </span>
          </div>

          {/* Category & Subcategory */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
              <FolderTree className="h-4 w-4 shrink-0" />
              <span>Category</span>
            </div>
            <div className="text-right truncate">
              <span className="font-medium text-slate-900 dark:text-white truncate block">
                {category?.name || "Uncategorized"}
              </span>
              {subcategory && (
                <span className="block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  Subcategory: {subcategory.name}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Description</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-50 sm:max-w-xs wrap-break-word">
                {transaction.description}
              </span>
            </div>
          )}

          {/* Payment Fee Row */}
          {transaction.feeAmount > 0 && (
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
                <Receipt className="h-4 w-4 shrink-0" />
                <span>Payment Fee</span>
              </div>
              <MoneyDisplay
                amount={transaction.feeAmount}
                currency={transaction.currency}
                colorize
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 gap-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 shrink-0">
              <TagIcon className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end max-w-xs">
              {transaction.tags && transaction.tags.length > 0 ? (
                transaction.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    #{t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No tags</span>
              )}
            </div>
          </div>

          {/* Attachments & Receipts Section */}
          <div className="border-b border-slate-100 dark:border-slate-700/50 pb-2.5 sm:pb-3 space-y-2">
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <Paperclip className="h-4 w-4 shrink-0" />
              <span>Attachments ({attachments?.length || 0})</span>
            </div>

            {!attachments || attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No receipts attached
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {attachments.map((att) => (
                  <AttachmentItem
                    key={att.id || att.fileName}
                    attachment={att}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Created At Audit Timestamp */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Created At</span>
            </div>
            <span className="truncate">
              {transaction.createdAt
                ? new Date(transaction.createdAt).toLocaleString()
                : "—"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 sm:mt-6 flex justify-end pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-10 touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;
