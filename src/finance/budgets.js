// src/finance/budgets.js

import db from "../db/database";
import { money } from "./money";
import { convertTransactionToBudgetCurrency } from "./conversions";

export const calculateBudgetPeriodDates = (period, targetDate = new Date()) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();

  let startDate = "";
  let endDate = "";

  if (period === "daily") {
    const iso = date.toISOString().split("T")[0];
    startDate = iso;
    endDate = iso;
  } else if (period === "weekly") {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  } else if (period === "monthly") {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  } else if (period === "quarterly") {
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const start = new Date(year, quarterStartMonth, 1);
    const end = new Date(year, quarterStartMonth + 3, 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  } else if (period === "semi_annual") {
    const halfStartMonth = month < 6 ? 0 : 6;
    const start = new Date(year, halfStartMonth, 1);
    const end = new Date(year, halfStartMonth + 6, 0);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  } else if (period === "yearly") {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    startDate = start.toISOString().split("T")[0];
    endDate = end.toISOString().split("T")[0];
  }

  return { startDate, endDate };
};

/**
 * Calculates live spending with multi-currency conversion support.
 */
export const calculateBudgetUsage = async (budget) => {
  if (!budget) {
    return {
      baseAmount: 0,
      spentAmount: 0,
      rolloverAmount: 0,
      totalAvailable: 0,
      remainingAmount: 0,
      percentageUsed: 0,
      isOverBudget: false,
    };
  }

  const baseAmount = Number(budget.amount || 0);
  const budgetCurrency = budget.currency || "USD";
  const { startDate, endDate } = calculateBudgetPeriodDates(budget.period);

  // 1. Fetch qualifying transactions (Expenses only)
  let txCollection = db.transactions.filter(
    (t) =>
      t.isDeleted !== true &&
      t.type === "expense" &&
      t.date >= startDate &&
      t.date <= endDate,
  );

  if (budget.categoryId) {
    txCollection = txCollection.filter(
      (t) => t.categoryId === budget.categoryId,
    );
  }
  if (budget.subcategoryId) {
    txCollection = txCollection.filter(
      (t) => t.subcategoryId === budget.subcategoryId,
    );
  }
  if (budget.tagId) {
    txCollection = txCollection.filter(
      (t) => Array.isArray(t.tags) && t.tags.includes(budget.tagId),
    );
  }

  const matchingTransactions = await txCollection.toArray();

  // 2. Convert each expense into budget currency and sum
  let spentAmount = 0;
  for (const t of matchingTransactions) {
    const convertedImpact = await convertTransactionToBudgetCurrency(
      t,
      budgetCurrency,
    );
    spentAmount = money.add(spentAmount, convertedImpact);
  }

  // 3. Rollover Calculation (if enabled)
  let rolloverAmount = 0;
  if (budget.rolloverEnabled && budget.period === "monthly") {
    const currentDate = new Date();
    const prevMonthDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    const { startDate: prevStart, endDate: prevEnd } =
      calculateBudgetPeriodDates("monthly", prevMonthDate);

    let prevTxCollection = db.transactions.filter(
      (t) =>
        t.isDeleted !== true &&
        t.type === "expense" &&
        t.date >= prevStart &&
        t.date <= prevEnd,
    );

    if (budget.categoryId) {
      prevTxCollection = prevTxCollection.filter(
        (t) => t.categoryId === budget.categoryId,
      );
    }
    if (budget.subcategoryId) {
      prevTxCollection = prevTxCollection.filter(
        (t) => t.subcategoryId === budget.subcategoryId,
      );
    }

    const prevTxList = await prevTxCollection.toArray();

    let prevSpent = 0;
    for (const t of prevTxList) {
      const convertedImpact = await convertTransactionToBudgetCurrency(
        t,
        budgetCurrency,
      );
      prevSpent = money.add(prevSpent, convertedImpact);
    }

    rolloverAmount = money.subtract(baseAmount, prevSpent);
  }

  const totalAvailable = money.add(baseAmount, rolloverAmount);
  const remainingAmount = money.subtract(totalAvailable, spentAmount);
  const percentageUsed =
    totalAvailable > 0
      ? Math.min(100, Math.round((spentAmount / totalAvailable) * 100))
      : 0;
  const isOverBudget = spentAmount > totalAvailable;

  return {
    baseAmount,
    spentAmount,
    rolloverAmount,
    totalAvailable,
    remainingAmount,
    percentageUsed,
    isOverBudget,
    periodStartDate: startDate,
    periodEndDate: endDate,
  };
};
