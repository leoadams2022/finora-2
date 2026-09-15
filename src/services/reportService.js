// src/services/reportService.js

import db from "../db/database";
import { money } from "../finance/money";
import { getTriangulatedExchangeRate } from "../finance/conversions";
import { calculateBudgetUsage } from "../finance/budgets";
import { calculateAccountBalance } from "../finance/balances";
import { calculateDebtBalance } from "../finance/debts";
import { getDateRange } from "./dashboardService";

export const reportService = {
  /**
   * Main orchestrator method to calculate pre-processed datasets for all report sections.
   */
  async getReportData({
    datePreset = "this_month",
    customStart = null,
    customEnd = null,
    targetViewCurrency = null,
  } = {}) {
    // 1. Resolve date range
    const { startDate, endDate } = getDateRange(
      datePreset,
      customStart,
      customEnd,
    );

    // 2. Resolve view currency (default to system base/default currency or USD)
    let displayCurrency = targetViewCurrency;
    if (!displayCurrency) {
      const defaultCurr = await db.currencies
        .filter((c) => c.isDefault)
        .first();
      displayCurrency = defaultCurr ? defaultCurr.code : "USD";
    }

    // 3. Parallel fetch of core database entities
    const [
      transactions,
      txLines,
      accounts,
      categories,
      subcategories,
      // eslint-disable-next-line no-unused-vars
      tags,
      budgets,
      debts,
      peopleEntities,
      snapshots,
    ] = await Promise.all([
      db.transactions.filter((t) => !t.isDeleted).toArray(),
      db.transactionLines.filter((l) => !l.isDeleted).toArray(),
      db.accounts.filter((a) => a.isActive).toArray(),
      db.categories.toArray(),
      db.subcategories.toArray(),
      db.tags.toArray(),
      db.budgets.toArray(),
      db.debts.filter((d) => !d.isDeleted).toArray(),
      db.peopleEntities.toArray(),
      db.netWorthSnapshots.toArray(),
    ]);

    // Fast lookup maps
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const subcategoryMap = new Map(subcategories.map((s) => [s.id, s]));
    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const personMap = new Map(peopleEntities.map((p) => [p.id, p]));

    // Cache exchange rates to displayCurrency
    const rateCache = new Map();
    const getRate = async (fromCode) => {
      if (!fromCode || fromCode === displayCurrency) return 1.0;
      if (rateCache.has(fromCode)) return rateCache.get(fromCode);
      const rate = await getTriangulatedExchangeRate(fromCode, displayCurrency);
      rateCache.set(fromCode, rate);
      return rate;
    };

    // Filter transactions by date range for time-bounded reports
    const inRangeTransactions = transactions.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    // Extract valid in-range transaction IDs
    const inRangeTxIds = new Set(inRangeTransactions.map((t) => t.id));
    const inRangeLines = txLines.filter((l) =>
      inRangeTxIds.has(l.transactionId),
    );

    // ------------------------------------------------------------------
    // REPORT 1: EXPENSE ANALYSIS
    // ------------------------------------------------------------------
    const expenseCategoryTotals = {};
    const expenseSubcategoryTotals = {};
    const expenseAccountTotals = {};
    const expenseTagTotals = {};
    let totalExpensesBase = 0;

    for (const line of inRangeLines) {
      if (line.type === "expense") {
        const rate = await getRate(line.currency || "USD");
        const converted = money.multiply(Number(line.amount || 0), rate);
        totalExpensesBase = money.add(totalExpensesBase, converted);

        // By Category
        const cat = categoryMap.get(line.categoryId);
        const catName = cat ? cat.name : "Uncategorized";
        expenseCategoryTotals[catName] = money.add(
          expenseCategoryTotals[catName] || 0,
          converted,
        );

        // By Subcategory
        if (line.subcategoryId) {
          const sub = subcategoryMap.get(line.subcategoryId);
          if (sub) {
            expenseSubcategoryTotals[sub.name] = money.add(
              expenseSubcategoryTotals[sub.name] || 0,
              converted,
            );
          }
        }

        // By Account
        const acc = accountMap.get(line.accountId);
        const accName = acc ? acc.name : "Unknown Account";
        expenseAccountTotals[accName] = money.add(
          expenseAccountTotals[accName] || 0,
          converted,
        );
      }
    }

    // Process Tags for Expense Transactions
    for (const tx of inRangeTransactions) {
      if (
        tx.type === "expense" &&
        Array.isArray(tx.tags) &&
        tx.tags.length > 0
      ) {
        const rate = await getRate(tx.currency || "USD");
        const converted = money.multiply(
          Number(tx.totalImpact || tx.amount || 0),
          rate,
        );
        for (const tagName of tx.tags) {
          expenseTagTotals[tagName] = money.add(
            expenseTagTotals[tagName] || 0,
            converted,
          );
        }
      }
    }

    const expenseByCategoryChart = Object.entries(expenseCategoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expenseBySubcategoryChart = Object.entries(expenseSubcategoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expenseByAccountChart = Object.entries(expenseAccountTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const expenseByTagChart = Object.entries(expenseTagTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ------------------------------------------------------------------
    // REPORT 2: INCOME ANALYSIS
    // ------------------------------------------------------------------
    const incomeCategoryTotals = {};
    const incomeAccountTotals = {};
    let totalIncomeBase = 0;

    for (const line of inRangeLines) {
      if (line.type === "income") {
        const rate = await getRate(line.currency || "USD");
        const converted = money.multiply(Number(line.amount || 0), rate);
        totalIncomeBase = money.add(totalIncomeBase, converted);

        // By Category / Source
        const cat = categoryMap.get(line.categoryId);
        const catName = cat ? cat.name : "Other Income";
        incomeCategoryTotals[catName] = money.add(
          incomeCategoryTotals[catName] || 0,
          converted,
        );

        // By Account
        const acc = accountMap.get(line.accountId);
        const accName = acc ? acc.name : "Unknown Account";
        incomeAccountTotals[accName] = money.add(
          incomeAccountTotals[accName] || 0,
          converted,
        );
      }
    }

    const incomeByCategoryChart = Object.entries(incomeCategoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const incomeByAccountChart = Object.entries(incomeAccountTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ------------------------------------------------------------------
    // REPORT 3: CASH FLOW ANALYSIS
    // ------------------------------------------------------------------
    const netCashFlowBase = money.subtract(totalIncomeBase, totalExpensesBase);
    const savingsRate =
      totalIncomeBase > 0
        ? Math.max(0, Math.round((netCashFlowBase / totalIncomeBase) * 100))
        : 0;

    // Group transactions by Date for Cash Flow Trend Chart
    const cashFlowTrendMap = {};
    for (const tx of inRangeTransactions) {
      if (!cashFlowTrendMap[tx.date]) {
        cashFlowTrendMap[tx.date] = {
          date: tx.date,
          income: 0,
          expense: 0,
          net: 0,
        };
      }
      const rate = await getRate(tx.currency || "USD");
      const converted = money.multiply(
        Number(tx.totalImpact || tx.amount || 0),
        rate,
      );

      if (tx.type === "income") {
        cashFlowTrendMap[tx.date].income = money.add(
          cashFlowTrendMap[tx.date].income,
          converted,
        );
      } else if (tx.type === "expense") {
        cashFlowTrendMap[tx.date].expense = money.add(
          cashFlowTrendMap[tx.date].expense,
          converted,
        );
      }
    }

    const cashFlowTrendChart = Object.values(cashFlowTrendMap)
      .map((item) => ({
        ...item,
        net: money.subtract(item.income, item.expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Separate Transfer Movement Summary (Transfers are NOT expenses)
    let totalTransfersVolumeBase = 0;
    const transferList = [];

    for (const tx of inRangeTransactions) {
      if (tx.isTransferTransaction) {
        const rate = await getRate(tx.currency || "USD");
        const converted = money.multiply(Number(tx.amount || 0), rate);
        totalTransfersVolumeBase = money.add(
          totalTransfersVolumeBase,
          converted,
        );

        const sourceAcc = accountMap.get(tx.accountId);
        const destAcc = accountMap.get(tx.destinationAccountId);

        transferList.push({
          id: tx.id,
          date: tx.date,
          fromAccount: sourceAcc ? sourceAcc.name : "Unknown",
          toAccount: destAcc ? destAcc.name : "Unknown",
          amount: tx.amount,
          currency: tx.currency,
          convertedAmount: converted,
        });
      }
    }

    // ------------------------------------------------------------------
    // REPORT 4: BUDGET PERFORMANCE
    // ------------------------------------------------------------------
    const budgetReports = [];
    let totalBudgetedBase = 0;
    let totalBudgetSpentBase = 0;

    for (const b of budgets) {
      const usage = await calculateBudgetUsage(b);
      const bRate = await getRate(b.currency || "USD");

      const availableBase = money.multiply(usage.totalAvailable, bRate);
      const spentBase = money.multiply(usage.spentAmount, bRate);
      const remainingBase = money.multiply(usage.remainingAmount, bRate);

      totalBudgetedBase = money.add(totalBudgetedBase, availableBase);
      totalBudgetSpentBase = money.add(totalBudgetSpentBase, spentBase);

      budgetReports.push({
        id: b.id,
        name: b.name,
        period: b.period,
        currency: b.currency,
        targetAmount: b.amount,
        availableAmount: usage.totalAvailable,
        spentAmount: usage.spentAmount,
        remainingAmount: usage.remainingAmount,
        percentageUsed: usage.percentageUsed,
        isOverBudget: usage.isOverBudget,
        rolloverAmount: usage.rolloverAmount,
        availableBase,
        spentBase,
        remainingBase,
      });
    }

    const budgetOverviewChart = budgetReports.map((b) => ({
      name: b.name,
      Budgeted: b.availableBase,
      Spent: b.spentBase,
    }));

    // ------------------------------------------------------------------
    // REPORT 5: NET WORTH & DEBT EXPOSURE
    // ------------------------------------------------------------------
    let totalAssetsBase = 0;
    let totalLiabilitiesBase = 0;

    // Accounts Asset / Liability calculation
    for (const acc of accounts) {
      const rawBalance = await calculateAccountBalance(acc.id);
      const rate = await getRate(acc.currency || "USD");
      const converted = money.multiply(rawBalance, rate);

      if (acc.type === "credit_card" || acc.type === "loan") {
        totalLiabilitiesBase = money.add(
          totalLiabilitiesBase,
          Math.abs(converted),
        );
      } else if (rawBalance < 0) {
        totalLiabilitiesBase = money.add(
          totalLiabilitiesBase,
          Math.abs(converted),
        );
      } else {
        totalAssetsBase = money.add(totalAssetsBase, converted);
      }
    }

    // Debts Asset / Liability calculation
    const debtExposureMap = {};
    for (const d of debts) {
      const stats = await calculateDebtBalance(d.id);
      if (stats.remainingBalance > 0) {
        const rate = await getRate(d.currency || "USD");
        const converted = money.multiply(stats.remainingBalance, rate);

        if (d.direction === "i_owe") {
          totalLiabilitiesBase = money.add(totalLiabilitiesBase, converted);
        } else {
          totalAssetsBase = money.add(totalAssetsBase, converted);
        }

        const person = personMap.get(d.personEntityId);
        const pName = person ? person.name : "Unknown Entity";

        if (!debtExposureMap[pName]) {
          debtExposureMap[pName] = { name: pName, iOwe: 0, theyOwe: 0 };
        }

        if (d.direction === "i_owe") {
          debtExposureMap[pName].iOwe = money.add(
            debtExposureMap[pName].iOwe,
            converted,
          );
        } else {
          debtExposureMap[pName].theyOwe = money.add(
            debtExposureMap[pName].theyOwe,
            converted,
          );
        }
      }
    }

    const netWorthBase = money.subtract(totalAssetsBase, totalLiabilitiesBase);

    // Historical Net Worth Chart from Snapshots
    const netWorthTrendChart = await Promise.all(
      snapshots
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(async (s) => {
          const rate = await getRate(s.currency || "USD");
          return {
            date: s.date,
            NetWorth: money.multiply(s.netWorth, rate),
            Assets: money.multiply(s.totalAssets, rate),
            Liabilities: money.multiply(s.totalLiabilities, rate),
          };
        }),
    );

    const debtExposureChart = Object.values(debtExposureMap);

    return {
      displayCurrency,
      dateRange: { startDate, endDate },

      // Expense Report Data
      expenseSummary: {
        totalExpensesBase,
        categoryChart: expenseByCategoryChart,
        subcategoryChart: expenseBySubcategoryChart,
        accountChart: expenseByAccountChart,
        tagChart: expenseByTagChart,
      },

      // Income Report Data
      incomeSummary: {
        totalIncomeBase,
        categoryChart: incomeByCategoryChart,
        accountChart: incomeByAccountChart,
      },

      // Cash Flow Report Data
      cashFlowSummary: {
        totalIncomeBase,
        totalExpensesBase,
        netCashFlowBase,
        savingsRate,
        cashFlowTrendChart,
        totalTransfersVolumeBase,
        transferList,
      },

      // Budget Report Data
      budgetSummary: {
        totalBudgetedBase,
        totalBudgetSpentBase,
        budgetOverviewChart,
        budgetReports,
      },

      // Net Worth & Debt Data
      netWorthSummary: {
        totalAssetsBase,
        totalLiabilitiesBase,
        netWorthBase,
        netWorthTrendChart,
        debtExposureChart,
      },
    };
  },
};

export default reportService;
