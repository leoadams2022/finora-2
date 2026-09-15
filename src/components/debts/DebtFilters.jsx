// src/components/debts/DebtFilters.jsx
import React from "react";
import { Filter, X } from "lucide-react";
import Select from "../ui/Select";

/**
 * Filter panel and quick direction tabs component for Debts page.
 */
export const DebtFilters = ({
  showFilters,
  // eslint-disable-next-line no-unused-vars
  onToggleFilters,
  filters,
  onFilterChange,
  onResetFilters,
  peopleEntities = [],
  accounts = [],
}) => {
  return (
    <div className="space-y-3 sm:space-y-4 px-0.5">
      {/* Direction Quick Tabs */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          type="button"
          onClick={() => onFilterChange("direction", "")}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold transition touch-manipulation min-h-9.5 sm:min-h-0 ${
            filters.direction === ""
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
          }`}
        >
          All Debts
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("direction", "i_owe")}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold transition touch-manipulation min-h-9.5 sm:min-h-0 ${
            filters.direction === "i_owe"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
          }`}
        >
          I Owe
        </button>
        <button
          type="button"
          onClick={() => onFilterChange("direction", "they_owe")}
          className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-2 sm:py-1.5 text-xs font-semibold transition touch-manipulation min-h-9.5 sm:min-h-0 ${
            filters.direction === "they_owe"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
          }`}
        >
          Owed To Me
        </button>
      </div>

      {/* Advanced Filter Collapsible Bar */}
      {showFilters && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3 transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filter Debts
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center space-x-1 text-xs text-rose-500 hover:underline active:opacity-75 transition touch-manipulation py-1 px-0.5"
            >
              <X className="h-3.5 w-3.5 shrink-0" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Person / Entity */}
            <div>
              <Select
                label="Person / Entity"
                value={filters.personEntityId}
                onChange={(val) => onFilterChange("personEntityId", val)}
                searchable
                placeholder="All People / Entities"
              >
                <Select.Option value="">All People / Entities</Select.Option>
                {peopleEntities.map((p) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name} ({p.type})
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Status */}
            <div>
              <Select
                label="Status"
                value={filters.status}
                onChange={(val) => onFilterChange("status", val)}
                placeholder="All Statuses"
              >
                <Select.Option value="">All Statuses</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="partially_paid">
                  Partially Paid
                </Select.Option>
                <Select.Option value="paid">Paid</Select.Option>
                <Select.Option value="overdue">Overdue</Select.Option>
                <Select.Option value="cancelled">Cancelled</Select.Option>
              </Select>
            </div>

            {/* Linked Account */}
            <div>
              <Select
                label="Linked Account"
                value={filters.accountId}
                onChange={(val) => onFilterChange("accountId", val)}
                searchable
                placeholder="All Accounts"
              >
                <Select.Option value="">All Accounts</Select.Option>
                {accounts.map((acc) => (
                  <Select.Option key={acc.id} value={acc.id}>
                    {acc.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange("startDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Due Date
              </label>
              <input
                type="date"
                value={filters.dueDate}
                onChange={(e) => onFilterChange("dueDate", e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            {/* Created At */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Created Date
              </label>
              <input
                type="date"
                value={filters.createdAt}
                onChange={(e) => onFilterChange("createdAt", e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            {/* Original Amount Min/Max */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Min Original Amount
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minOriginalAmount}
                onChange={(e) =>
                  onFilterChange("minOriginalAmount", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Max Original Amount
              </label>
              <input
                type="number"
                placeholder="99999.00"
                value={filters.maxOriginalAmount}
                onChange={(e) =>
                  onFilterChange("maxOriginalAmount", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            {/* Total Paid Min/Max */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Min Total Paid
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minTotalPaid}
                onChange={(e) => onFilterChange("minTotalPaid", e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Max Total Paid
              </label>
              <input
                type="number"
                placeholder="99999.00"
                value={filters.maxTotalPaid}
                onChange={(e) => onFilterChange("maxTotalPaid", e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            {/* Remaining Balance Min/Max */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Min Remaining Balance
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={filters.minRemainingBalance}
                onChange={(e) =>
                  onFilterChange("minRemainingBalance", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
                Max Remaining Balance
              </label>
              <input
                type="number"
                placeholder="99999.00"
                value={filters.maxRemainingBalance}
                onChange={(e) =>
                  onFilterChange("maxRemainingBalance", e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtFilters;
