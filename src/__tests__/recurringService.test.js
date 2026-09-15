// src/__tests__/recurringService.test.js

import { describe, it, expect, beforeEach } from "vitest";
import db from "../db/database";
import {
  recurringService,
  calculateNextOccurrenceDate,
} from "../services/recurringService";

describe("recurringService Engine", () => {
  beforeEach(async () => {
    if (!db.isOpen()) {
      await db.open();
    }

    await db.transaction(
      "rw",
      [db.recurringTransactions, db.transactions, db.auditLogs],
      async () => {
        await db.recurringTransactions.clear();
        await db.transactions.clear();
        await db.auditLogs.clear();
      },
    );
  });

  it("calculates next occurrence dates accurately across frequencies", () => {
    expect(calculateNextOccurrenceDate("2026-01-15", "monthly")).toBe(
      "2026-02-15",
    );
    expect(calculateNextOccurrenceDate("2026-01-15", "weekly")).toBe(
      "2026-01-22",
    );
    expect(calculateNextOccurrenceDate("2026-01-15", "daily")).toBe(
      "2026-01-16",
    );
    expect(calculateNextOccurrenceDate("2026-01-15", "yearly")).toBe(
      "2027-01-15",
    );
  });

  it("creates a recurring rule and executes due occurrences into real ledger transactions", async () => {
    const rule = await recurringService.createRecurringTransaction({
      name: "Netflix Subscription",
      type: "expense",
      amount: 15,
      currency: "USD",
      accountId: "acc_main",
      categoryId: "cat_sub",
      frequency: "monthly",
      startDate: "2026-01-01",
      nextOccurrence: "2026-01-01",
      autoCreate: true,
    });

    expect(rule.id).toMatch(/^rec_/);

    // Process due items as of 2026-01-05
    const createdTx =
      await recurringService.processDueRecurringTransactions("2026-01-05");
    expect(createdTx.length).toBe(1);
    expect(createdTx[0].amount).toBe(15);
    expect(createdTx[0].description).toBe("Netflix Subscription");

    // Verify next occurrence advanced
    const updatedRule = await db.recurringTransactions.get(rule.id);
    expect(updatedRule.nextOccurrence).toBe("2026-02-01");
  });
});
