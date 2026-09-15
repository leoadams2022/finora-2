// src/components/ui/MoneyDisplay.jsx

import React from "react";

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

  // eslint-disable-next-line no-useless-assignment
  let formatted = "";
  try {
    formatted = new Intl.NumberFormat("en-US", {
      style: showSymbol ? "currency" : "decimal",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    formatted = `${safeCurrency} ${numAmount.toFixed(2)}`;
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
