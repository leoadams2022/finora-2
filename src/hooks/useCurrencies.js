// src/hooks/useCurrencies.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useCurrencies = () => {
  const currenciesData = useLiveQuery(
    async () => {
      return await db.currencies.toArray();
    },
    [],
    [],
  );

  const currencies = currenciesData || [];

  /**
   * Helper function to match currency by CODE, NAME, or SYMBOL.
   * Priority: CODE -> NAME -> SYMBOL
   *
   * @param {string} searchTerm - Search query (code, name, or symbol)
   * @returns {object|null} Matched currency object or null
   */
  const getCurrency = (searchTerm) => {
    if (!searchTerm || typeof searchTerm !== "string") return null;

    const term = searchTerm.trim();
    if (!term) return null;

    let currency;

    // 1. Try matching by CODE (case-insensitive)
    currency = currencies.find(
      (c) => c.code && c.code.toUpperCase() === term.toUpperCase(),
    );
    if (currency) return currency;

    // 2. Try matching by NAME (case-insensitive)
    currency = currencies.find(
      (c) => c.name && c.name.toLowerCase() === term.toLowerCase(),
    );
    if (currency) return currency;

    // 3. Try matching by SYMBOL
    currency = currencies.find((c) => c.symbol && c.symbol === term);
    if (currency) return currency;

    return null;
  };

  return {
    currencies,
    getCurrency,
    isLoading: currenciesData === undefined,
  };
};
