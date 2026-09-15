// src/components/budgets/BudgetCard.jsx

import React from "react";
import { Edit2, Trash2, AlertCircle, ArrowUpRight } from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";

/**
 * Reusable card component for displaying individual budget targets.
 */
export const BudgetCard = ({ budget, category, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3.5 sm:space-y-4 hover:shadow-md transition">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {budget.period} Budget
          </span>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              title="Edit Budget"
              aria-label="Edit Budget"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget)}
              className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              title="Delete Budget"
              aria-label="Delete Budget"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Budget Title & Category Badge */}
        <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
          {budget.name}
        </h3>
        {category && (
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-slate-500">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: category.color || "#10b981" }}
            />
            <span className="truncate">{category.name}</span>
          </div>
        )}

        {/* Progress Bar & Amounts */}
        <div className="mt-3.5 sm:mt-4 space-y-1.5 sm:space-y-1">
          <div className="flex justify-between text-xs gap-1">
            <span className="text-slate-500 shrink-0">Spent:</span>
            <span className="font-semibold text-slate-900 dark:text-white truncate text-right">
              <MoneyDisplay
                amount={budget.spentAmount}
                currency={budget.currency}
              />{" "}
              /{" "}
              <MoneyDisplay
                amount={budget.totalAvailable}
                currency={budget.currency}
              />
            </span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                budget.isOverBudget
                  ? "bg-rose-500"
                  : budget.percentageUsed > 80
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(100, budget.percentageUsed)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Status Indicators */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2.5 sm:pt-3 text-xs gap-2">
        {budget.isOverBudget ? (
          <span className="flex items-center space-x-1 text-rose-500 font-semibold truncate min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Over budget by{" "}
              <MoneyDisplay
                amount={Math.abs(budget.remainingAmount)}
                currency={budget.currency}
              />
            </span>
          </span>
        ) : (
          <span className="text-slate-500 truncate min-w-0">
            Remaining:{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              <MoneyDisplay
                amount={budget.remainingAmount}
                currency={budget.currency}
              />
            </span>
          </span>
        )}

        {budget.rolloverEnabled && (
          <span
            className="flex items-center space-x-1 text-[10px] sm:text-[11px] text-blue-500 font-medium shrink-0"
            title="Rollover enabled"
          >
            <ArrowUpRight className="h-3 w-3 shrink-0" />
            <span>Rollover</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default BudgetCard;
