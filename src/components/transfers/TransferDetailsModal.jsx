// src/components/transfers/TransferDetailsModal.jsx
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../db/database";
import {
  X,
  ArrowRight,
  ArrowDown,
  Paperclip,
  Calendar,
  Clock,
  CreditCard,
  Tag,
} from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";
import { useAccounts } from "../../hooks/useAccounts";
import AttachmentItem from "../common/AttachmentItem";

const TransferDetailsModal = ({ isOpen, onClose, transfer }) => {
  const { accounts } = useAccounts();

  // Fetch attachments associated with this transfer reactively
  const attachments = useLiveQuery(
    async () => {
      if (!transfer?.id) return [];
      return await db.attachments
        .where("transactionId")
        .equals(transfer.id)
        .toArray();
    },
    [transfer?.id],
    [],
  );

  if (!isOpen || !transfer) return null;

  const sourceAcc = accounts.find((a) => a.id === transfer.accountId);
  const destAcc = accounts.find((a) => a.id === transfer.destinationAccountId);
  const isCrossCurrency =
    transfer.currency !== (transfer.destinationCurrency || transfer.currency);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container / Mobile Bottom Sheet */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            Transfer Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5">
          {/* Transfer Summary Card */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                Account Flow
              </span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold">
                Completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-2.5 sm:gap-3">
              {/* Source Account */}
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium uppercase">
                  From
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {sourceAcc?.name || "Unknown Account"}
                </p>
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                  -
                  <MoneyDisplay
                    amount={transfer.amount}
                    currency={transfer.currency}
                  />
                </p>
              </div>

              {/* Indicator Arrow (Horizontal on Desktop, Vertical on Mobile) */}
              <div className="flex justify-center">
                <div className="p-1.5 sm:p-2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ArrowRight className="hidden sm:block h-4 w-4" />
                  <ArrowDown className="block sm:hidden h-4 w-4" />
                </div>
              </div>

              {/* Destination Account */}
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium uppercase">
                  To
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {destAcc?.name || "Unknown Account"}
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +
                  <MoneyDisplay
                    amount={transfer.destinationAmount || transfer.amount}
                    currency={transfer.destinationCurrency || transfer.currency}
                  />
                </p>
              </div>
            </div>

            {/* Cross Currency Exchange Rate Info */}
            {isCrossCurrency && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs flex justify-between text-slate-600 dark:text-slate-300 gap-2">
                <span className="font-medium shrink-0">Exchange Rate:</span>
                <span className="font-bold truncate text-right">
                  1 {transfer.currency} = {transfer.exchangeRate}{" "}
                  {transfer.destinationCurrency}
                </span>
              </div>
            )}
          </div>

          {/* Details Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  Date
                </p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {transfer.date}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  Time
                </p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {transfer.time || "12:00"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  Transfer Fee
                </p>
                <div className="font-semibold text-slate-900 dark:text-white truncate">
                  {transfer.feeAmount > 0 ? (
                    <MoneyDisplay
                      amount={transfer.feeAmount}
                      currency={transfer.feeCurrency || transfer.currency}
                    />
                  ) : (
                    "No Fee"
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
              <Tag className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  Transfer ID
                </p>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {transfer.id}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {transfer.description && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 wrap-break-word">
                {transfer.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {transfer.tags && transfer.tags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {transfer.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <Paperclip className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Attachments ({attachments ? attachments.length : 0})</span>
            </p>

            {attachments && attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <AttachmentItem
                    key={att.id || att.fileName}
                    attachment={att}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No files attached to this transfer.
              </p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-4 sm:pt-5 mt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:bg-slate-300 transition min-h-10 touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferDetailsModal;
