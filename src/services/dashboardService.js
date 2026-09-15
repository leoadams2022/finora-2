// src/services/dashboardService.js

import db from "../db/database";
import { calculateAccountBalance } from "../finance/balances";
import { getTriangulatedExchangeRate } from "../finance/conversions";
import { money } from "../finance/money";

/**
 * Calculates date range boundaries based on preset filter keys.
 */
export const getDateRange = (
  filterPreset,
  customStart = null,
  customEnd = null,
) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let start = new Date(year, month, 1);
  let end = new Date(year, month + 1, 0);

  switch (filterPreset) {
    case "today":
      start = new Date(now);
      end = new Date(now);
      break;
    case "yesterday":
      start = new Date(now);
      start.setDate(now.getDate() - 1);
      end = new Date(start);
      break;
    case "this_week": {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case "last_week": {
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - 7);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      break;
    }
    case "this_month":
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
      break;
    case "last_month":
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0);
      break;
    case "this_year":
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
      break;
    case "last_year":
      start = new Date(year - 1, 0, 1);
      end = new Date(year - 1, 11, 31);
      break;
    case "custom":
      if (customStart && customEnd) {
        return { startDate: customStart, endDate: customEnd };
      }
      break;
    default:
      start = new Date(year, month, 1);
      end = new Date(year, month + 1, 0);
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const dashboardService = {
  /**
   * Primary Dashboard data compilation.
   * Converts and normalizes all totals/charts to targetViewCurrency (or system base currency).
   */
  async getDashboardSummary(
    dateFilter = "this_month",
    customStart = null,
    customEnd = null,
    targetViewCurrency = null,
  ) {
    // 1. Resolve system Base Currency
    const baseCurrRecord = await db.currencies
      .filter((c) => c.isBase === true)
      .first();
    const systemBaseCurrency = baseCurrRecord ? baseCurrRecord.code : "USD";

    // Display currency selected by user (defaults to system base currency)
    const displayCurrency = targetViewCurrency || systemBaseCurrency;

    const { startDate, endDate } = getDateRange(
      dateFilter,
      customStart,
      customEnd,
    );

    // 2. Fetch Accounts & calculate balances converted to display Currency
    const accounts = await db.accounts.toArray();
    let totalAssetsBase = 0;
    let totalLiabilitiesBase = 0;

    const accountSummaries = await Promise.all(
      accounts.map(async (acc) => {
        const balance = await calculateAccountBalance(acc.id);
        const rateToDisplay = await getTriangulatedExchangeRate(
          acc.currency,
          displayCurrency,
        );
        const balanceInDisplay = money.multiply(balance, rateToDisplay);

        if (acc.type === "credit_card" || acc.type === "loan") {
          const debtAmount = Math.max(
            0,
            balance < 0 ? Math.abs(balance) : balance,
          );
          const debtInDisplay = money.multiply(debtAmount, rateToDisplay);
          totalLiabilitiesBase = money.add(totalLiabilitiesBase, debtInDisplay);
        } else {
          totalAssetsBase = money.add(totalAssetsBase, balanceInDisplay);
        }

        return {
          ...acc,
          currentBalance: balance,
          balanceInBase: balanceInDisplay,
          displayCurrency,
        };
      }),
    );

    // 3. Add active debt liabilities
    const activeDebts = await db.debts
      .filter(
        (d) =>
          d.isDeleted !== true &&
          d.status !== "paid" &&
          d.status !== "cancelled" &&
          d.direction === "i_owe",
      )
      .toArray();

    for (const debt of activeDebts) {
      const debtBal = Number(debt.currentBalance || 0);
      const rateToDisplay = await getTriangulatedExchangeRate(
        debt.currency || "USD",
        displayCurrency,
      );
      totalLiabilitiesBase = money.add(
        totalLiabilitiesBase,
        money.multiply(debtBal, rateToDisplay),
      );
    }

    const netWorthBase = money.subtract(totalAssetsBase, totalLiabilitiesBase);

    // 4. Fetch period Transactions (Expenses & Income)
    const transactions = await db.transactions
      .filter(
        (t) =>
          t.isDeleted !== true &&
          t.status !== "cancelled" &&
          t.date >= startDate &&
          t.date <= endDate,
      )
      .toArray();

    // 🔒 Chronological sort by date descending (Newest first)
    transactions.sort((a, b) => {
      const dateCompare = (b.date || "").localeCompare(a.date || "");
      if (dateCompare !== 0) return dateCompare;
      return (b.createdAt || b.id || "").localeCompare(
        a.createdAt || a.id || "",
      );
    });

    let totalIncomeBase = 0;
    let totalExpensesBase = 0;

    const categoryBreakdownMap = {};

    for (const t of transactions) {
      const impact = Number(t.totalImpact || t.amount || 0);
      const rateToDisplay = await getTriangulatedExchangeRate(
        t.currency || "USD",
        displayCurrency,
      );
      const impactInDisplay = money.multiply(impact, rateToDisplay);

      if (t.type === "income") {
        totalIncomeBase = money.add(totalIncomeBase, impactInDisplay);
      } else if (t.type === "expense") {
        totalExpensesBase = money.add(totalExpensesBase, impactInDisplay);

        const catId = t.categoryId || "uncategorized";
        categoryBreakdownMap[catId] = money.add(
          categoryBreakdownMap[catId] || 0,
          impactInDisplay,
        );
      }
    }

    const netCashFlowBase = money.subtract(totalIncomeBase, totalExpensesBase);

    // 5. Format Category Chart Data
    const categoryIds = Object.keys(categoryBreakdownMap);
    const categoryRecords = await db.categories
      .where("id")
      .anyOf(categoryIds)
      .toArray();
    const catMap = new Map(categoryRecords.map((c) => [c.id, c.name]));

    const expenseByCategoryChart = categoryIds.map((catId) => ({
      name: catMap.get(catId) || "Other / General",
      value: categoryBreakdownMap[catId],
    }));

    return {
      systemBaseCurrency,
      displayCurrency,
      startDate,
      endDate,
      totalAssetsBase,
      totalLiabilitiesBase,
      netWorthBase,
      totalIncomeBase,
      totalExpensesBase,
      netCashFlowBase,
      accountSummaries,
      expenseByCategoryChart,
      // Top 5 newest transactions chronologically
      recentTransactions: transactions.slice(0, 5),
    };
  },
};
