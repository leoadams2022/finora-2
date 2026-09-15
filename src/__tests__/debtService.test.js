import { describe, it, expect, beforeEach } from "vitest";
import db from "../db/database";
import { debtService } from "../services/debtService";
import { calculateAccountBalance } from "../finance/balances";

describe("debtService - createDebt", () => {
  const accountId = "acc_1789240176489_twckp";
  const personEntityId = "pe_test_john_doe";

  beforeEach(async () => {
    if (!db.isOpen()) {
      await db.open();
    }

    // Clear all tables within atomic transaction context
    await db.transaction(
      "rw",
      [
        db.accounts,
        db.peopleEntities,
        db.debts,
        db.debtPayments,
        db.transactions,
        db.transactionLines,
        db.auditLogs,
      ],
      async () => {
        await db.debts.clear();
        await db.debtPayments.clear();
        await db.transactions.clear();
        await db.transactionLines.clear();
        await db.auditLogs.clear();
        await db.accounts.clear();
        await db.peopleEntities.clear();

        // Seed test account
        await db.accounts.add({
          id: accountId,
          name: "Primary Checking",
          type: "checking",
          currency: "USD",
          openingBalance: 1000,
          isActive: true,
          createdAt: new Date().toISOString(),
        });

        // Seed test person/entity
        await db.peopleEntities.add({
          id: personEntityId,
          name: "John Doe",
          type: "Person",
          createdAt: new Date().toISOString(),
        });
      },
    );
  });

  it("creates a debt record without linked account cash flow", async () => {
    const payload = {
      direction: "i_owe",
      personEntityId,
      originalAmount: 250,
      currency: "USD",
      startDate: "2026-09-12",
      dueDate: "2026-10-12",
      notes: "Test borrowing without account link",
    };

    const newDebt = await debtService.createDebt(payload);

    expect(newDebt).toBeDefined();
    expect(newDebt.id).toMatch(/^debt_/);
    expect(newDebt.originalAmount).toBe(250);
    expect(newDebt.personEntityId).toBe(personEntityId);
    expect(newDebt.status).toBe("active");

    // Account balance remains untouched
    const accountBalance = await calculateAccountBalance(accountId);
    expect(accountBalance).toBe(1000);
  });

  it('creates a "Money I Owe" debt linked to an account and records Cash Inflow (+Income Effect)', async () => {
    const payload = {
      direction: "i_owe",
      personEntityId,
      originalAmount: 500,
      currency: "USD",
      startDate: "2026-09-12",
      accountId,
      notes: "Borrowed money received into account",
    };

    const newDebt = await debtService.createDebt(payload);

    expect(newDebt.accountId).toBe(accountId);

    // Initial Transaction Header & Line verification
    const initialTx = await db.transactions.get(`tx_${newDebt.id}_init`);
    expect(initialTx).toBeDefined();
    expect(initialTx.type).toBe("income");
    expect(initialTx.amount).toBe(500);

    // Account balance updated ($1000 + $500 = $1500)
    const updatedBalance = await calculateAccountBalance(accountId);
    expect(updatedBalance).toBe(1500);
  });

  it('creates a "Money Owed To Me" debt linked to an account and records Cash Outflow (+Expense Effect)', async () => {
    const payload = {
      direction: "they_owe",
      personEntityId,
      originalAmount: 300,
      currency: "USD",
      startDate: "2026-09-12",
      accountId,
      notes: "Lent money given out from account",
    };

    const newDebt = await debtService.createDebt(payload);

    const initialTx = await db.transactions.get(`tx_${newDebt.id}_init`);
    expect(initialTx).toBeDefined();
    expect(initialTx.type).toBe("expense");

    // Account balance updated ($1000 - $300 = $700)
    const updatedBalance = await calculateAccountBalance(accountId);
    expect(updatedBalance).toBe(700);
  });
});
