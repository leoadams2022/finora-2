// src/components/reports/ReportHeader.jsx

import React from "react";
import { Coins } from "lucide-react";
import Select from "../ui/Select";
import { PRESET_DATE_RANGES } from "../../utils/dates";

/**
 * Filter header bar for the Reports page.
 */
export const ReportHeader = ({
  datePreset,
  onDatePresetChange,
  customStart,
  customEnd,
  onCustomDateChange,
  targetViewCurrency,
  onCurrencyChange,
  currencies = [],
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
      {/* Date Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs w-full sm:w-auto">
        <div className="w-full sm:w-40 shrink-0">
          <Select
            label="Date Filter"
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

        {datePreset === "custom" && (
          <div className="flex items-center space-x-2 pt-0 sm:pt-5 w-full sm:w-auto">
            <input
              type="date"
              value={customStart || ""}
              onChange={(e) => onCustomDateChange("start", e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none min-h-10"
            />
            <span className="text-slate-400 shrink-0">to</span>
            <input
              type="date"
              value={customEnd || ""}
              onChange={(e) => onCustomDateChange("end", e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white outline-none min-h-10"
            />
          </div>
        )}
      </div>

      {/* Target View Currency Switcher */}
      <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center space-x-2 shrink-0">
          <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">
            Report Base:
          </span>
        </div>
        <div className="w-32 shrink-0">
          <Select
            value={targetViewCurrency}
            onChange={(val) => onCurrencyChange(val)}
            searchable
            placeholder="Select Currency"
          >
            {currencies.map((c) => (
              <Select.Option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
