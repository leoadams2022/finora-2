// src/db/defaultData.js

import db from "./database";

export const DEFAULT_CURRENCIES = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimalPlaces: 2,
    rateToUSD: 1.0,
    isBase: true,
    isDefault: true,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimalPlaces: 2,
    rateToUSD: 0.92,
    isBase: false,
  },
  {
    code: "EGP",
    symbol: "E£",
    name: "Egyptian Pound",
    decimalPlaces: 2,
    rateToUSD: 50,
    isBase: false,
  },
  {
    code: "SAR",
    symbol: "SR",
    name: "Saudi Riyal",
    decimalPlaces: 2,
    rateToUSD: 3.75,
    isBase: false,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimalPlaces: 2,
    rateToUSD: 0.78,
    isBase: false,
  },
];

export const DEFAULT_CATEGORIES = [
  {
    id: "cat_food",
    name: "Food & Dining",
    type: "expense",
    icon: "Utensils",
    color: "#ef4444",
    isActive: true,
  },
  {
    id: "cat_transport",
    name: "Transportation",
    type: "expense",
    icon: "Car",
    color: "#f59e0b",
    isActive: true,
  },
  {
    id: "cat_housing",
    name: "Housing & Utilities",
    type: "expense",
    icon: "Home",
    color: "#3b82f6",
    isActive: true,
  },
  {
    id: "cat_fees",
    name: "Fees & Administrative",
    type: "expense",
    icon: "Receipt",
    color: "#64748b",
    isActive: true,
  },
  {
    id: "cat_income",
    name: "Income / Salary",
    type: "income",
    icon: "Wallet",
    color: "#10b981",
    isActive: true,
  },
];

export const DEFAULT_SUBCATEGORIES = [
  {
    id: "sub_groceries",
    categoryId: "cat_food",
    name: "Groceries",
    isActive: true,
  },
  {
    id: "sub_restaurants",
    categoryId: "cat_food",
    name: "Restaurants",
    isActive: true,
  },
  {
    id: "sub_fuel",
    categoryId: "cat_transport",
    name: "Fuel",
    isActive: true,
  },
  {
    id: "sub_payment_fees",
    categoryId: "cat_fees",
    name: "Payment Fees",
    isActive: true,
  },
  {
    id: "sub_transfer_fees",
    categoryId: "cat_fees",
    name: "Transfer Fees",
    isActive: true,
  },
];

/**
 * Seed initial default system data (Default Categories & Base Currencies)
 * strictly for first-run initialization without wiping existing data.
 */
export const initializeDefaultData = async () => {
  await db.transaction(
    "rw",
    [db.currencies, db.categories, db.subcategories],
    async () => {
      // Seed Base Currencies if table is empty
      const currencyCount = await db.currencies.count();
      if (currencyCount === 0) {
        await db.currencies.bulkAdd(DEFAULT_CURRENCIES);
      }

      // Seed Core Default Categories if table is empty
      const categoryCount = await db.categories.count();
      if (categoryCount === 0) {
        await db.categories.bulkAdd(DEFAULT_CATEGORIES);
        await db.subcategories.bulkAdd(DEFAULT_SUBCATEGORIES);
      }
    },
  );
};
