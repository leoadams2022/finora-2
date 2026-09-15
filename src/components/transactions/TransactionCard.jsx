// src/components/transactions/TransactionCard.jsx
import React from "react";
import {
  Calendar,
  Wallet,
  FolderTree,
  Paperclip,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import TagTooltip from "./TagTooltip";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Compact view card representation of a single transaction record.
 */
export const TransactionCard = ({
  tx,
  account,
  category,
  subcategory,
  attachmentCount = 0,
  getCurrency,
  accounts = [],
  onView,
  onEdit,
  onDelete,
  viewOnly = false,
}) => {
  const isExpense = tx.type === "expense";

  let badgeLabel = tx.type;
  let badgeClass = isExpense
    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
    : tx.type === "income"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";

  if (tx.isTransferTransaction) {
    badgeLabel = "Transfer";
    badgeClass =
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400";
  } else if (tx.isDebtTransaction) {
    badgeLabel = tx.type === "income" ? "Debt In" : "Debt Out";
    badgeClass =
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  }

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition space-y-3">
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}
          >
            {badgeLabel}
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
              <span>{tx.date}</span>
            </span>
          </div>
        </div>

        {/* Title & Amount */}
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate min-w-0 flex-1">
            {tx.description || category?.name || "Transaction"}
          </h3>
          <div className="text-right shrink-0">
            <MoneyDisplay
              amount={isExpense ? -tx.totalImpact : tx.amount}
              currency={tx.currency}
              colorize={!tx.isTransferTransaction}
              className="text-sm sm:text-base font-bold"
            />
            {tx.isTransferTransaction && (
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                {tx.feeAmount > 0 && (
                  <div>
                    Fee:{" "}
                    <MoneyDisplay
                      amount={tx.feeAmount}
                      currency={tx.feeCurrency || tx.currency}
                      className="text-slate-500 dark:text-slate-400"
                    />
                  </div>
                )}
                {tx.currency !== tx.destinationCurrency && (
                  <div>
                    Rate: 1 {getCurrency(tx.currency)?.symbol || tx.currency} ={" "}
                    {tx.exchangeRate}{" "}
                    {getCurrency(tx.destinationCurrency)?.symbol ||
                      tx.destinationCurrency}
                  </div>
                )}
              </div>
            )}
            {tx.isDebtTransaction && (
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 space-y-0.5">
                {tx.debtCurrencyAmount && tx.debtCurrency !== tx.currency && (
                  <>
                    <div>
                      Currency Amount:{" "}
                      <MoneyDisplay
                        amount={tx.debtCurrencyAmount}
                        currency={tx.debtCurrency}
                        className="text-slate-500 dark:text-slate-400"
                      />
                    </div>
                    <div>
                      Rate: 1{" "}
                      {getCurrency(tx.debtCurrency)?.symbol || tx.debtCurrency}{" "}
                      = {tx.exchangeRate}{" "}
                      {getCurrency(tx.currency)?.symbol || tx.currency}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account & Category Meta */}
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1 min-w-0 truncate">
            <Wallet className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            {tx.isTransferTransaction ? (
              <span className="flex items-center space-x-1 truncate">
                <span className="truncate">
                  {accounts.find((a) => a.id === tx.accountId)?.name ||
                    "Unknown"}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">
                  {accounts.find((a) => a.id === tx.destinationAccountId)
                    ?.name || "Unknown"}
                </span>
              </span>
            ) : (
              <span className="truncate">{account?.name || "Account"}</span>
            )}
          </span>
          {category && (
            <span className="flex items-center space-x-1 min-w-0 truncate">
              <FolderTree className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{category.name}</span>
              {subcategory && (
                <span className="text-[11px] text-slate-400 truncate">
                  ({subcategory.name})
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Footer Controls & Tags */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2.5 sm:pt-3 gap-2">
        <TagTooltip tags={tx.tags} />

        <div className="flex items-center space-x-1 shrink-0">
          <button
            type="button"
            onClick={() => onView(tx)}
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
                onClick={() => onEdit(tx)}
                className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Edit Record"
                aria-label="Edit Record"
              >
                <Edit2 className="h-4 w-4 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(tx)}
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

export default TransactionCard;
