// src/__tests__/conversions.test.js

import { describe, it, expect, beforeEach } from "vitest";
import db from "../db/database";
import {
  getRateRelativeToUSD,
  getTriangulatedExchangeRate,
  convertTransactionToBudgetCurrency,
} from "../finance/conversions";

describe("Currency Conversions & Triangulation Engine", () => {
  beforeEach(async () => {
    if (!db.isOpen()) {
      await db.open();
    }

    // Reset and seed currencies table with standard rates
    await db.transaction("rw", db.currencies, async () => {
      await db.currencies.clear();
      await db.currencies.bulkPut([
        {
          code: "USD",
          name: "US Dollar",
          symbol: "$",
          rateToUSD: 1.0,
          isBase: true,
        },
        {
          code: "EGP",
          name: "Egyptian Pound",
          symbol: "E£",
          rateToUSD: 50.0,
          isBase: false,
        },
        {
          code: "EUR",
          name: "Euro",
          symbol: "€",
          rateToUSD: 0.92,
          isBase: false,
        },
      ]);
    });
  });

  it("fetches correct rateToUSD for configured currencies", async () => {
    const usdRate = await getRateRelativeToUSD("USD");
    const egpRate = await getRateRelativeToUSD("EGP");

    expect(usdRate).toBe(1.0);
    expect(egpRate).toBe(50.0);
  });

  it("calculates triangulated exchange rate from USD to EGP", async () => {
    // Rate from USD -> EGP: rateToUSD(EGP) / rateToUSD(USD) = 50.0 / 1.0 = 50.0
    const rateToEGP = await getTriangulatedExchangeRate("USD", "EGP");
    expect(rateToEGP).toBe(50.0);
  });

  it("converts 100 USD transaction into 5000 EGP for an EGP budget", async () => {
    const transaction = {
      id: "tx_usd_expense",
      amount: 100,
      totalImpact: 100,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
    };

    const budgetCurrency = "EGP";

    const convertedAmount = await convertTransactionToBudgetCurrency(
      transaction,
      budgetCurrency,
    );

    // 100 USD * 50.0 = 5000 EGP
    expect(convertedAmount).toBe(5000);
  });
});
