// src/components/transfers/TransferCard.jsx
import React from "react";
import {
  Calendar,
  Wallet,
  Paperclip,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import TagTooltip from "../transactions/TagTooltip";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Compact view card representation of a single transfer record.
 * Touch-optimized for small mobile viewports with min hit areas and responsive truncation.
 */
export const TransferCard = ({
  transfer,
  sourceAccount,
  destinationAccount,
  attachmentCount = 0,
  getCurrency,
  accounts = [],
  onView,
  onEdit,
  onDelete,
  viewOnly = false,
}) => {
  const isCrossCurrency =
    transfer.currency !== (transfer.destinationCurrency || transfer.currency);

  const resolvedSourceAcc =
    sourceAccount || accounts.find((a) => a.id === transfer.accountId);
  const resolvedDestAcc =
    destinationAccount ||
    accounts.find((a) => a.id === transfer.destinationAccountId);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition space-y-3">
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
            Transfer
          </span>
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {attachmentCount > 0 && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
                <Paperclip className="h-3 w-3 text-emerald-500 shrink-0" />
                <span>{attachmentCount}</span>
              </span>
            )}
            <span className="text-[11px] sm:text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{transfer.date}</span>
            </span>
          </div>
        </div>

        {/* Title & Amount */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate min-w-0 flex-1">
            {transfer.description ||
              `Transfer to ${resolvedDestAcc?.name || "Account"}`}
          </h3>
          <div className="text-right shrink-0">
            <MoneyDisplay
              amount={transfer.amount}
              currency={transfer.currency}
              colorize={false}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white"
            />
            {transfer.feeAmount > 0 && (
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                Fee:{" "}
                <MoneyDisplay
                  amount={transfer.feeAmount}
                  currency={transfer.feeCurrency || transfer.currency}
                  className="text-slate-500 dark:text-slate-400"
                />
              </div>
            )}
            {isCrossCurrency && (
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>
                  Received:{" "}
                  <MoneyDisplay
                    amount={transfer.destinationAmount}
                    currency={transfer.destinationCurrency}
                    className="text-emerald-600 dark:text-emerald-400 font-medium"
                  />
                </div>
                <div>
                  Rate: 1{" "}
                  {getCurrency
                    ? getCurrency(transfer.currency)?.symbol ||
                      transfer.currency
                    : transfer.currency}{" "}
                  = {transfer.exchangeRate}{" "}
                  {getCurrency
                    ? getCurrency(transfer.destinationCurrency)?.symbol ||
                      transfer.destinationCurrency
                    : transfer.destinationCurrency}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Source -> Destination Accounts Meta */}
        <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <Wallet className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-1.5" />
          <div className="flex items-center space-x-1.5 truncate min-w-0 font-medium">
            <span className="truncate text-slate-700 dark:text-slate-300">
              {resolvedSourceAcc?.name || "Unknown Account"}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-700 dark:text-slate-300">
              {resolvedDestAcc?.name || "Unknown Account"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Controls & Tags */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2.5 sm:pt-3 gap-2">
        <TagTooltip tags={transfer.tags} />

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => onView && onView(transfer)}
            className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            title="View Details"
            aria-label="View Details"
          >
            <Eye className="h-4 w-4 shrink-0" />
          </button>
          {!viewOnly && (
            <>
              <button
                type="button"
                onClick={() => onEdit && onEdit(transfer)}
                className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Edit Record"
                aria-label="Edit Record"
              >
                <Edit2 className="h-4 w-4 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onDelete && onDelete(transfer)}
                className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Delete Record"
                aria-label="Delete Record"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferCard;
