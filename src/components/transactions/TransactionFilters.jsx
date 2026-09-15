// src/components/transactions/TransactionFilters.jsx
import React from "react";
import { X } from "lucide-react";
import Select from "../ui/Select";
import { PRESET_DATE_RANGES } from "../../utils/dates";

/**
 * Filter panel for Transactions page with mobile touch optimization and responsive grid layouts.
 */
export const TransactionFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  datePreset,
  onDatePresetChange,
  accounts = [],
  categories = [],
  activeSubcategories = [],
  tags = [],
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3 transition-all">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Filter Transactions
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Account */}
        <div>
          <Select
            label="Account"
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

        {/* Type */}
        <div>
          <Select
            label="Type"
            value={filters.type}
            onChange={(val) => onFilterChange("type", val)}
            placeholder="All Types"
          >
            <Select.Option value="">All Types</Select.Option>
            <Select.Option value="expense">Expense</Select.Option>
            <Select.Option value="income">Income</Select.Option>
            <Select.Option value="transfer">Transfer</Select.Option>
            <Select.Option value="refund">Refund</Select.Option>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Select
            label="Category"
            value={filters.categoryId}
            onChange={(val) => {
              onFilterChange("categoryId", val);
              onFilterChange("subcategoryId", "");
            }}
            searchable
            placeholder="All Categories"
          >
            <Select.Option value="">All Categories</Select.Option>
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id} color={cat.color}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Subcategory */}
        <div>
          <Select
            label="Subcategory"
            disabled={!filters.categoryId || activeSubcategories.length === 0}
            value={filters.subcategoryId}
            onChange={(val) => onFilterChange("subcategoryId", val)}
            searchable
            placeholder="All Subcategories"
          >
            <Select.Option value="">All Subcategories</Select.Option>
            {activeSubcategories.map((sub) => (
              <Select.Option key={sub.id} value={sub.id}>
                {sub.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Tag */}
        <div>
          <Select
            label="Tag"
            value={filters.tag}
            onChange={(val) => onFilterChange("tag", val)}
            searchable
            placeholder="All Tags"
          >
            <Select.Option value="">All Tags</Select.Option>
            {tags.map((t) => (
              <Select.Option key={t.id} value={t.name}>
                #{t.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Date Preset */}
        <div>
          <Select
            label="Date Range"
            value={datePreset}
            onChange={(val) => onDatePresetChange(val)}
            placeholder="Select Range"
          >
            {PRESET_DATE_RANGES.map((preset) => (
              <Select.Option key={preset.key} value={preset.key}>
                {preset.label}
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
            onChange={(e) => {
              onDatePresetChange("custom");
              onFilterChange("startDate", e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              onDatePresetChange("custom");
              onFilterChange("endDate", e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>

        {/* Min Amount */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            Min Amount
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={filters.minAmount}
            onChange={(e) => onFilterChange("minAmount", e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>

        {/* Max Amount */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            Max Amount
          </label>
          <input
            type="number"
            placeholder="99999.00"
            value={filters.maxAmount}
            onChange={(e) => onFilterChange("maxAmount", e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
