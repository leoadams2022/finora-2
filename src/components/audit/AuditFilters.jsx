// src/components/audit/AuditFilters.jsx

import React from "react";
import { Search, X } from "lucide-react";
import Select from "../ui/Select";
import { PRESET_DATE_RANGES } from "../../utils/dates";

export const AuditFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  datePreset,
  onDatePresetChange,
  accounts = [],
  peopleEntities = [],
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Audit History Filters
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
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            Search Keyword
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              placeholder="Search description, ID, account, entity..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-8 pr-3 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition min-h-10"
            />
          </div>
        </div>

        {/* Record Type */}
        <div>
          <Select
            label="Record Type"
            value={filters.entityType}
            onChange={(val) => onFilterChange("entityType", val)}
            placeholder="All Record Types"
          >
            <Select.Option value="">All Record Types</Select.Option>
            <Select.Option value="transaction">
              Standard Transactions
            </Select.Option>
            <Select.Option value="transfer">Transfers</Select.Option>
            <Select.Option value="debt">Debts & Liabilities</Select.Option>
            <Select.Option value="debt_payment">Debt Payments</Select.Option>
          </Select>
        </div>

        {/* Deletion Status */}
        <div>
          <Select
            label="Deletion Status"
            value={filters.deletionStatus}
            onChange={(val) => onFilterChange("deletionStatus", val)}
            placeholder="All Records"
          >
            <Select.Option value="all">All Records</Select.Option>
            <Select.Option value="active">Active Only</Select.Option>
            <Select.Option value="deleted">Soft-Deleted Only</Select.Option>
          </Select>
        </div>

        {/* Created-At Preset Date Range */}
        <div>
          <Select
            label="Created At Range"
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

        {/* Created-At Start Date */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            Created At (Start)
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => {
              onDatePresetChange("custom");
              onFilterChange("startDate", e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>

        {/* Created-At End Date */}
        <div>
          <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1 text-[11px] sm:text-xs">
            Created At (End)
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => {
              onDatePresetChange("custom");
              onFilterChange("endDate", e.target.value);
            }}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
          />
        </div>

        {/* Account Filter */}
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
      </div>
    </div>
  );
};

export default AuditFilters;
