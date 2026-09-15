// src/finance/conversions.js

import db from "../db/database";
import { money } from "./money";

/**
 * Gets currency exchange rate relative to USD directly from db.currencies.
 * If currency is USD, rate relative to USD is 1.0.
 */
export const getRateRelativeToUSD = async (currencyCode) => {
  if (!currencyCode || currencyCode === "USD") return 1.0;

  const currRecord = await db.currencies.get(currencyCode);
  if (currRecord && Number(currRecord.rateToUSD) > 0) {
    return Number(currRecord.rateToUSD);
  }

  return 1.0;
};

/**
 * Calculates cross-currency conversion rate using USD rateToUSD as the triangulation bridge.
 * Returns how many units of `toCurrency` equal 1 unit of `fromCurrency`.
 * Formula: Rate(From -> To) = rateToUSD(To) / rateToUSD(From)
 *
 * Example:
 * 1 USD = 50 EGP (rateToUSD = 50)
 * 1 USD = 1 USD (rateToUSD = 1)
 * Rate(USD -> EGP) = 50 / 1 = 50 EGP per USD
 * Rate(EGP -> USD) = 1 / 50 = 0.02 USD per EGP
 */
export const getTriangulatedExchangeRate = async (fromCurrency, toCurrency) => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return 1.0;

  const rateFromUSD = await getRateRelativeToUSD(fromCurrency);
  const rateToUSD = await getRateRelativeToUSD(toCurrency);

  if (rateFromUSD <= 0) return 1.0;

  return rateToUSD / rateFromUSD;
};

/**
 * Converts a transaction amount into the target currency using rates stored on currencies.
 * Example: 100 USD spent on an EGP budget (50 EGP / USD):
 * rate = getTriangulatedExchangeRate('USD', 'EGP') = 50.0
 * money.multiply(100, 50.0) = 5000 EGP
 */
export const convertTransactionToBudgetCurrency = async (
  transaction,
  budgetCurrency,
) => {
  const txAmount = Number(transaction.totalImpact || transaction.amount || 0);
  const txCurrency = transaction.currency || "USD";

  if (txCurrency === budgetCurrency) {
    return txAmount;
  }

  // Preserve explicit recorded cross-currency transaction rate if present
  if (transaction.debtCurrency === budgetCurrency && transaction.exchangeRate) {
    return money.multiply(txAmount, Number(transaction.exchangeRate));
  }

  // Get rate (how many budget Currency units per 1 transaction Currency unit)
  const rateToBudgetCurrency = await getTriangulatedExchangeRate(
    txCurrency,
    budgetCurrency,
  );

  // Multiply transaction amount by the exchange rate
  return money.multiply(txAmount, rateToBudgetCurrency);
};
