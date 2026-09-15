// src/components/transactions/TransactionTable.jsx
import React from "react";
import {
  ArrowUpDown,
  Paperclip,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import TagTooltip from "./TagTooltip";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Desktop table view for transactions with column header sorting and touch-optimized action targets.
 */
export const TransactionTable = ({
  transactions = [],
  accounts = [],
  categories = [],
  subcategories = [],
  attachmentCounts = {},
  getCurrency,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 min-w-187.5">
        <thead className="bg-slate-50 text-[10px] sm:text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 select-none">
          <tr>
            <th
              onClick={() => onSort("date")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Date</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("type")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Type</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th className="px-3 sm:px-4 py-3">Account</th>
            <th
              onClick={() => onSort("category")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Category</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th className="px-3 sm:px-4 py-3">Description</th>
            <th className="px-3 sm:px-4 py-3 text-center">Tags</th>
            <th className="px-3 sm:px-4 py-3 text-center">Files</th>
            <th
              onClick={() => onSort("amount")}
              className="px-3 sm:px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Amount</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th className="px-3 sm:px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {transactions.map((tx) => {
            const account = accounts.find((a) => a.id === tx.accountId);
            const category = categories.find((c) => c.id === tx.categoryId);
            const subcategory = subcategories.find(
              (s) => s.id === tx.subcategoryId,
            );
            const isExpense = tx.type === "expense";
            const attCount =
              attachmentCounts?.[tx.id] || attachmentCounts?.[tx.debtId] || 0;

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
              <tr
                key={tx.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
              >
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs">
                  {tx.date}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                  >
                    {badgeLabel}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                  {tx.isTransferTransaction ? (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span>
                        {accounts.find((a) => a.id === tx.accountId)?.name ||
                          "Unknown"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        {accounts.find((a) => a.id === tx.destinationAccountId)
                          ?.name || "Unknown"}
                      </span>
                    </div>
                  ) : (
                    account?.name || "Unknown"
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs">
                  {category ? (
                    <div className="flex flex-col">
                      <span className="flex items-center space-x-1.5 font-medium">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: category.color || "#3b82f6",
                          }}
                        />
                        <span>{category.name}</span>
                      </span>
                      {subcategory && (
                        <span className="text-[11px] text-slate-400 pl-3.5">
                          {subcategory.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                  {tx.description || "—"}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                  <TagTooltip tags={tx.tags} />
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                  {attCount > 0 ? (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <Paperclip className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span>{attCount}</span>
                    </span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600">
                      —
                    </span>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right font-semibold">
                  <div className="flex flex-col items-end">
                    <MoneyDisplay
                      amount={isExpense ? -tx.totalImpact : tx.amount}
                      currency={tx.currency}
                      colorize={!tx.isTransferTransaction}
                    />
                    {tx.isTransferTransaction && (
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 space-y-0.5">
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
                            Rate: 1{" "}
                            {getCurrency(tx.currency)?.symbol || tx.currency} ={" "}
                            {tx.exchangeRate}{" "}
                            {getCurrency(tx.destinationCurrency)?.symbol ||
                              tx.destinationCurrency}
                          </div>
                        )}
                      </div>
                    )}
                    {tx.isDebtTransaction && (
                      <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 space-y-0.5">
                        {tx.debtCurrencyAmount &&
                          tx.debtCurrency !== tx.currency && (
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
                                {getCurrency(tx.debtCurrency)?.symbol ||
                                  tx.debtCurrency}{" "}
                                = {tx.exchangeRate}{" "}
                                {getCurrency(tx.currency)?.symbol ||
                                  tx.currency}
                              </div>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onView(tx)}
                      className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                    </button>
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
