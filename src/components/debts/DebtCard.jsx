// src/components/debts/DebtCard.jsx
import React from "react";
import {
  DollarSign,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Compact view card representation of a single debt record.
 */
export const DebtCard = ({
  debt,
  person,
  onPay,
  onView,
  onEdit,
  onDelete,
  viewOnly = false,
}) => {
  const isIOwe = debt.direction === "i_owe";

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition space-y-3">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              isIOwe
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            }`}
          >
            {isIOwe ? "I Owe" : "They Owe"}
          </span>
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium capitalize text-slate-600 dark:text-slate-300 truncate">
            {debt.status ? debt.status.replace("_", " ") : "active"}
          </span>
        </div>

        {/* Entity Name & Primary Balance */}
        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <div className="flex items-center space-x-1.5 truncate min-w-0 flex-1">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {person?.name || "Unknown Entity"}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Remaining
            </span>
            <MoneyDisplay
              amount={debt.remainingBalance}
              currency={debt.currency}
              colorize={isIOwe}
              className="text-sm sm:text-base font-bold"
            />
          </div>
        </div>

        {/* Financial Metrics Breakdown */}
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs border border-slate-100 dark:border-slate-700/50">
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">
              Original Amount
            </span>
            <MoneyDisplay
              amount={debt.originalAmount}
              currency={debt.currency}
              className="font-semibold text-slate-700 dark:text-slate-200 truncate"
            />
          </div>
          <div className="text-right min-w-0">
            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">
              Total Paid
            </span>
            <MoneyDisplay
              amount={debt.totalPaid}
              currency={debt.currency}
              className="font-medium text-slate-500 dark:text-slate-400 truncate"
            />
          </div>
        </div>

        {/* Dates Info */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center space-x-1 shrink-0">
            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
            <span>Start: {debt.startDate}</span>
          </div>
          {debt.dueDate && (
            <div className="flex items-center space-x-1 text-slate-400 shrink-0">
              <span>Due: {debt.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls & Audit Timestamp */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2.5 sm:pt-3 text-xs gap-2">
        <div
          className="flex items-center space-x-1 text-slate-400 text-[10px] shrink-0"
          title="Created Timestamp"
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>
            {debt.createdAt
              ? new Date(debt.createdAt).toLocaleDateString()
              : "—"}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {!viewOnly && debt.remainingBalance > 0 && (
            <button
              type="button"
              onClick={() => onPay(debt)}
              className="flex items-center space-x-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 sm:py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 active:bg-emerald-200 dark:active:bg-emerald-900 transition touch-manipulation min-h-8 sm:min-h-0"
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
            title="View Details"
            aria-label="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {!viewOnly && (
            <>
              <button
                type="button"
                onClick={() => onEdit(debt)}
                className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Edit Debt"
                aria-label="Edit Debt"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(debt)}
                className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                title="Delete Debt"
                aria-label="Delete Debt"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebtCard;
