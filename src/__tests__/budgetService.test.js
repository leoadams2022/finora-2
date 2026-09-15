/* eslint-disable no-unused-vars */
// src/__tests__/budgetService.test.js

import { describe, it, expect, beforeEach } from "vitest";
import db from "../db/database";
import { budgetService } from "../services/budgetService";
import { calculateBudgetUsage } from "../finance/budgets";
it("triangulates budget spending between non-USD currencies (EGP -> EUR via USD)", async () => {
  // 1. Seed currencies: 1 USD = 50 EGP, 1 USD = 1.0 EUR
  await db.currencies.put({
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    rateToUSD: 1.0,
  });
  await db.currencies.put({
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "E£",
    rateToUSD: 50.0,
  });
  await db.currencies.put({
    code: "EUR",
    name: "Euro",
    symbol: "€",
    rateToUSD: 1.0,
  });

  // 2. Create budget in EUR (€100 EUR limit)
  const budget = await budgetService.createBudget({
    name: "Euro Dining Budget",
    amount: 100,
    currency: "EUR",
    period: "monthly",
    categoryId: "cat_dining",
  });

  const todayISO = new Date().toISOString().split("T")[0];

  // 3. Add expense of 2,500 EGP (2500 / 50 = $50 USD -> €50 EUR)
  await db.transactions.add({
    id: "tx_triangulated_expense",
    type: "expense",
    date: todayISO,
    amount: 2500,
    totalImpact: 2500,
    currency: "EGP",
    categoryId: "cat_dining",
    isDeleted: false,
  });

  const usage = await calculateBudgetUsage(budget);
  expect(usage.spentAmount).toBe(50); // 2,500 EGP converted to €50 EUR
  expect(usage.remainingAmount).toBe(50); // €100 - €50 = €50
});
