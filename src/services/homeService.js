// src/services/homeService.js

import db from "../db/database";
import { money } from "../finance/money";
import { getTriangulatedExchangeRate } from "../finance/conversions";
import { calculateAccountBalance } from "../finance/balances";
import { calculateDebtBalance } from "../finance/debts";
import { calculateBudgetUsage } from "../finance/budgets";

export const homeService = {
  async getHomeSummary(targetViewCurrency = null) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const monthStartISO = `${currentYear}-${currentMonth}-01`;

    // 1. Resolve Display Base Currency
    let displayCurrency = targetViewCurrency;
    if (!displayCurrency) {
      const defaultCurr = await db.currencies
        .filter((c) => c.isDefault)
        .first();
      displayCurrency = defaultCurr ? defaultCurr.code : "USD";
    }

    // 2. Fetch Core Entities
    const [
      transactions,
      txLines,
      accounts,
      categories,
      // eslint-disable-next-line no-unused-vars
      subcategories,
      // eslint-disable-next-line no-unused-vars
      tags,
      budgets,
      debts,
      // eslint-disable-next-line no-unused-vars
      peopleEntities,
    ] = await Promise.all([
      db.transactions.filter((t) => !t.isDeleted).toArray(),
      db.transactionLines.filter((l) => !l.isDeleted).toArray(),
      db.accounts.filter((a) => a.isActive !== false).toArray(),
      db.categories.toArray(),
      db.subcategories.toArray(),
      db.tags.toArray(),
      db.budgets.toArray(),
      db.debts.filter((d) => !d.isDeleted).toArray(),
      db.peopleEntities.toArray(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const rateCache = new Map();

    const getRate = async (fromCode) => {
      if (!fromCode || fromCode === displayCurrency) return 1.0;
      if (rateCache.has(fromCode)) return rateCache.get(fromCode);
      const rate = await getTriangulatedExchangeRate(fromCode, displayCurrency);
      rateCache.set(fromCode, rate);
      return rate;
    };

    // ------------------------------------------------------------------
    // SECTION 0: GENERAL INSIGHTS & TOTALS
    // ------------------------------------------------------------------
    let spentThisMonth = 0;
    let incomeThisMonth = 0;
    let totalMoneyAvailable = 0;
    let totalLiability = 0;
    let totalMoneyLoanedOut = 0;

    // Accounts Balances & Monthly Aggregates per Account
    const accountCardSummaries = await Promise.all(
      accounts.map(async (acc) => {
        const liveBalance = await calculateAccountBalance(acc.id);
        const accRate = await getRate(acc.currency || "USD");
        const convertedBalance = money.multiply(liveBalance, accRate);

        if (
          acc.type === "credit_card" ||
          acc.type === "loan" ||
          liveBalance < 0
        ) {
          totalLiability = money.add(
            totalLiability,
            Math.abs(convertedBalance),
          );
        } else {
          totalMoneyAvailable = money.add(
            totalMoneyAvailable,
            convertedBalance,
          );
        }

        // Account-level monthly income & expenses
        let accMonthlyExpense = 0;
        let accMonthlyIncome = 0;

        const accLines = txLines.filter((l) => {
          if (l.accountId !== acc.id) return false;
          const parentTx = transactions.find((t) => t.id === l.transactionId);
          return parentTx && parentTx.date >= monthStartISO;
        });

        for (const line of accLines) {
          if (line.type === "expense") {
            accMonthlyExpense = money.add(
              accMonthlyExpense,
              Number(line.amount || 0),
            );
          } else if (line.type === "income") {
            accMonthlyIncome = money.add(
              accMonthlyIncome,
              Number(line.amount || 0),
            );
          }
        }

        return {
          ...acc,
          currentBalance: liveBalance,
          convertedBalance,
          monthlyExpense: accMonthlyExpense,
          monthlyIncome: accMonthlyIncome,
        };
      }),
    );

    // Calculate General Monthly Spending & Income
    const monthTxLines = txLines.filter((l) => {
      const parentTx = transactions.find((t) => t.id === l.transactionId);
      return parentTx && parentTx.date >= monthStartISO;
    });

    for (const line of monthTxLines) {
      const rate = await getRate(line.currency || "USD");
      const converted = money.multiply(Number(line.amount || 0), rate);
      if (line.type === "expense") {
        spentThisMonth = money.add(spentThisMonth, converted);
      } else if (line.type === "income") {
        incomeThisMonth = money.add(incomeThisMonth, converted);
      }
    }

    // Debts Liabilities & Loans (Active or Partially Paid)
    const activeDebtsList = [];
    for (const d of debts) {
      const stats = await calculateDebtBalance(d.id);
      if (stats.remainingBalance > 0) {
        const rate = await getRate(d.currency || "USD");
        const convertedRemaining = money.multiply(stats.remainingBalance, rate);

        if (d.direction === "i_owe") {
          totalLiability = money.add(totalLiability, convertedRemaining);
        } else {
          totalMoneyLoanedOut = money.add(
            totalMoneyLoanedOut,
            convertedRemaining,
          );
        }

        activeDebtsList.push({
          ...d,
          ...stats,
        });
      }
    }

    // ------------------------------------------------------------------
    // SECTION 2: LATEST TRANSACTIONS
    // ------------------------------------------------------------------
    const latestTransactions = [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
      )
      .slice(0, 15);

    // ------------------------------------------------------------------
    // SECTION 4: CATEGORIES & TAGS INSIGHTS
    // ------------------------------------------------------------------
    const categoryExpenseMap = {};
    const categoryIncomeMap = {};
    const tagExpenseMap = {};
    const tagIncomeMap = {};

    for (const line of txLines) {
      const rate = await getRate(line.currency || "USD");
      const converted = money.multiply(Number(line.amount || 0), rate);
      const cat = categoryMap.get(line.categoryId);
      const catName = cat ? cat.name : "Uncategorized";

      if (line.type === "expense") {
        categoryExpenseMap[catName] = money.add(
          categoryExpenseMap[catName] || 0,
          converted,
        );
      } else if (line.type === "income") {
        categoryIncomeMap[catName] = money.add(
          categoryIncomeMap[catName] || 0,
          converted,
        );
      }
    }

    for (const tx of transactions) {
      if (Array.isArray(tx.tags) && tx.tags.length > 0) {
        const rate = await getRate(tx.currency || "USD");
        const converted = money.multiply(
          Number(tx.totalImpact || tx.amount || 0),
          rate,
        );

        for (const tagName of tx.tags) {
          if (tx.type === "expense") {
            tagExpenseMap[tagName] = money.add(
              tagExpenseMap[tagName] || 0,
              converted,
            );
          } else if (tx.type === "income") {
            tagIncomeMap[tagName] = money.add(
              tagIncomeMap[tagName] || 0,
              converted,
            );
          }
        }
      }
    }

    const getTopEntry = (map) => {
      const entries = Object.entries(map);
      if (entries.length === 0)
        return { name: "N/A", amount: 0, currency: displayCurrency };
      entries.sort((a, b) => b[1] - a[1]);
      return {
        name: entries[0][0],
        amount: entries[0][1],
        currency: displayCurrency,
      };
    };

    const categoryMostExpenses = getTopEntry(categoryExpenseMap);
    const categoryMostIncome = getTopEntry(categoryIncomeMap);
    const tagMostExpenses = getTopEntry(tagExpenseMap);
    const tagMostIncome = getTopEntry(tagIncomeMap);

    // ------------------------------------------------------------------
    // SECTION 5: BUDGETS LIST
    // ------------------------------------------------------------------
    const activeBudgetsList = await Promise.all(
      budgets.map(async (b) => {
        const usage = await calculateBudgetUsage(b);
        return { ...b, ...usage };
      }),
    );

    // ------------------------------------------------------------------
    // SECTION 6: CURRENCY INSIGHTS
    // ------------------------------------------------------------------
    const currencyExpenseMap = {};
    const currencyIncomeMap = {};

    for (const tx of transactions) {
      const curr = tx.currency || "USD";
      const amt = Number(tx.amount || 0);

      if (tx.type === "expense") {
        currencyExpenseMap[curr] = money.add(
          currencyExpenseMap[curr] || 0,
          amt,
        );
      } else if (tx.type === "income") {
        currencyIncomeMap[curr] = money.add(currencyIncomeMap[curr] || 0, amt);
      }
    }

    const mostUsedCurrencyExpenses = getTopEntry(currencyExpenseMap);
    const mostUsedCurrencyIncome = getTopEntry(currencyIncomeMap);

    return {
      displayCurrency,
      generalInsights: {
        spentThisMonth,
        incomeThisMonth,
        totalMoneyAvailable,
        totalLiability,
        totalMoneyLoanedOut,
      },
      accounts: accountCardSummaries,
      latestTransactions,
      activeDebts: activeDebtsList,
      categoryTagInsights: {
        categoryMostExpenses,
        tagMostExpenses,
        categoryMostIncome,
        tagMostIncome,
      },
      budgets: activeBudgetsList,
      currencyInsights: {
        mostUsedCurrencyExpenses,
        mostUsedCurrencyIncome,
      },
    };
  },
};

export default homeService;
