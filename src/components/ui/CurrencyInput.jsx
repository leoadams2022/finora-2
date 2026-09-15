// src/components/ui/CurrencyInput.jsx
import React from "react";
import { useCurrencies } from "../../hooks/useCurrencies";

/**
 * Reusable currency-aware amount input component.
 * Features touch-optimized tap targets, custom symbol display, and accessibility support.
 */
const CurrencyInput = ({
  value,
  onChange,
  currency = "",
  label,
  error,
  placeholder = "0.00",
  disabled = false,
  required = false,
}) => {
  const { getCurrency, isLoading: currenciesisLoading } = useCurrencies();

  if (currenciesisLoading) return null;

  const symbol = getCurrency(currency)?.symbol || currency;

  return (
    <div className="w-full">
      {label && (
        <label
          className={`mb-1 block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 ${
            required ? "required-asterisk" : ""
          }`}
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 select-none">
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {symbol}
          </span>
        </div>
        <input
          type="number"
          step="0.01"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`block w-full rounded-lg border pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 text-sm font-semibold text-slate-900 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 transition min-h-10.5 touch-manipulation ${
            error
              ? "border-rose-500 focus:ring-rose-500"
              : "border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500"
          } disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:opacity-50`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default CurrencyInput;
