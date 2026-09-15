// src/components/debts/DebtTable.jsx
import React from "react";
import { ArrowUpDown, DollarSign, Eye, Edit2, Trash2 } from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Table layout for full desktop representation of debts.
 */
export const DebtTable = ({
  debts = [],
  peopleEntities = [],
  onSort,
  onPay,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 min-w-175">
        <thead className="bg-slate-50 text-[10px] sm:text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 select-none">
          <tr>
            <th className="px-3 sm:px-4 py-3">Direction</th>
            <th
              onClick={() => onSort("personEntityId")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Person / Entity</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("startDate")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Start Date</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("dueDate")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Due Date</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("originalAmount")}
              className="px-3 sm:px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Original</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("totalPaid")}
              className="px-3 sm:px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Paid</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("remainingBalance")}
              className="px-3 sm:px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center justify-end space-x-1">
                <span>Remaining</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("status")}
              className="px-3 sm:px-4 py-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
            >
              <div className="flex items-center justify-center space-x-1">
                <span>Status</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th
              onClick={() => onSort("createdAt")}
              className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white whitespace-nowrap transition touch-manipulation"
            >
              <div className="flex items-center space-x-1">
                <span>Created At</span>
                <ArrowUpDown className="h-3 w-3 shrink-0" />
              </div>
            </th>
            <th className="px-3 sm:px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {debts.map((debt) => {
            const person = peopleEntities.find(
              (p) => p.id === debt.personEntityId,
            );
            const isIOwe = debt.direction === "i_owe";

            return (
              <tr
                key={debt.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
              >
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isIOwe
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    }`}
                  >
                    {isIOwe ? "I Owe" : "They Owe"}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                  {person?.name || "Unknown Entity"}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs">
                  {debt.startDate}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                  {debt.dueDate || "—"}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right font-medium">
                  <MoneyDisplay
                    amount={debt.originalAmount}
                    currency={debt.currency}
                  />
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right font-medium text-slate-500">
                  <MoneyDisplay
                    amount={debt.totalPaid}
                    currency={debt.currency}
                  />
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right font-bold">
                  <MoneyDisplay
                    amount={debt.remainingBalance}
                    currency={debt.currency}
                    colorize={isIOwe}
                  />
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium capitalize text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {debt.status ? debt.status.replace("_", " ") : "active"}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                  {debt.createdAt
                    ? new Date(debt.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1">
                    {debt.remainingBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => onPay(debt)}
                        className="flex items-center space-x-1 rounded-lg bg-emerald-50 px-2 py-1.5 sm:py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 active:bg-emerald-200 dark:active:bg-emerald-900 transition touch-manipulation min-h-8 sm:min-h-0"
                        title="Record Payment"
                      >
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        <span>Pay</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(debt)}
                      className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-blue-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="View Debt Details"
                      aria-label="View Debt Details"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(debt)}
                      className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Edit Debt"
                      aria-label="Edit Debt"
                    >
                      <Edit2 className="h-4 w-4 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(debt)}
                      className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                      title="Delete Debt"
                      aria-label="Delete Debt"
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

export default DebtTable;
