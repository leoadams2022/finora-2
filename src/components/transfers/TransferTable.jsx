// src/components/transfers/TransferTable.jsx
import React from "react";
import { ArrowRight, Paperclip, Eye, Edit2, Trash2 } from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Table view for displaying money transfers.
 */
export const TransferTable = ({
  transfers = [],
  accounts = [],
  attachmentCounts = {},
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 min-w-162.5">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Source Account</th>
            <th className="px-4 py-3 text-center"></th>
            <th className="px-4 py-3">Destination Account</th>
            <th className="px-4 py-3 text-right">Amount Sent</th>
            <th className="px-4 py-3 text-right">Amount Received</th>
            <th className="px-4 py-3 text-center">Fee</th>
            <th className="px-4 py-3 text-center">Files</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {transfers.map((trf) => {
            const sourceAcc = accounts.find((a) => a.id === trf.accountId);
            const destAcc = accounts.find(
              (a) => a.id === trf.destinationAccountId,
            );
            const attCount = attachmentCounts?.[trf.id] || 0;

            return (
              <tr
                key={trf.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
              >
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {trf.date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                  {sourceAcc?.name || "Unknown"}
                </td>
                <td className="px-4 py-3 text-center text-slate-400">
                  <ArrowRight className="h-4 w-4 inline" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                  {destAcc?.name || "Unknown"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-rose-600 dark:text-rose-400">
                  -
                  <MoneyDisplay amount={trf.amount} currency={trf.currency} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  +
                  <MoneyDisplay
                    amount={trf.destinationAmount || trf.amount}
                    currency={trf.destinationCurrency || trf.currency}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-xs">
                  {trf.feeAmount > 0 ? (
                    <MoneyDisplay
                      amount={trf.feeAmount}
                      currency={trf.feeCurrency || trf.currency}
                      colorize
                    />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
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
                <td className="px-4 py-3 whitespace-nowrap text-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onView && onView(trf)}
                    className="rounded p-1 text-slate-400 hover:text-blue-500 transition"
                    title="View Transfer Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(trf)}
                    className="rounded p-1 text-slate-400 hover:text-emerald-500 transition"
                    title="Edit Transfer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(trf)}
                    className="rounded p-1 text-slate-400 hover:text-rose-500 transition"
                    title="Delete Transfer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransferTable;
