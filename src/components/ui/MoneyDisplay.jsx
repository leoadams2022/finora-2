// src/components/ui/MoneyDisplay.jsx

import React from "react";
import { useCurrencies } from "../../hooks/useCurrencies";

const MoneyDisplay = ({
  amount = 0,
  currency = "USD",
  showSymbol = true,
  className = "",
  positiveClass = "text-emerald-600 dark:text-emerald-400",
  negativeClass = "text-rose-600 dark:text-rose-400",
  neutralClass = "text-slate-900 dark:text-white",
  colorize = false,
}) => {
  const { getCurrency } = useCurrencies();
  const numAmount = Number(amount || 0);

  // Validate ISO 4217 Currency Code (3 uppercase letters)
  let safeCurrency = "USD";
  if (
    typeof currency === "string" &&
    currency.trim().length === 3 &&
    /^[A-Z]{3}$/i.test(currency.trim())
  ) {
    safeCurrency = currency.trim().toUpperCase();
  }

  // Retrieve currency object from hook (priority: code -> name -> symbol)
  const currencyObj = getCurrency(safeCurrency);
  const symbol = currencyObj?.symbol;

  // eslint-disable-next-line no-useless-assignment
  let formatted = "";
  try {
    if (showSymbol) {
      if (symbol) {
        // Custom symbol formatting from the database (e.g., "$123.45", "123.45 EGP")
        const formattedNum = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numAmount);
        formatted = `${symbol} ${formattedNum}`;
      } else {
        // Fallback to standard Intl currency formatting
        formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: safeCurrency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numAmount);
      }
    } else {
      // Decimal format without currency symbol
      formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numAmount);
    }
  } catch (err) {
    formatted = `${symbol || safeCurrency} ${numAmount.toFixed(2)}`;
    console.error(err);
  }

  let colorColorClass = neutralClass;
  if (colorize) {
    if (numAmount > 0) colorColorClass = positiveClass;
    else if (numAmount < 0) colorColorClass = negativeClass;
  }

  return (
    <span className={`font-mono ${colorColorClass} ${className}`}>
      {formatted}
    </span>
  );
};

export default MoneyDisplay;
