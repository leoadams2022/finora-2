// src/services/netWorthService.js

import db from "../db/database";
import { calculateAccountBalance } from "../finance/balances";
import { getTriangulatedExchangeRate } from "../finance/conversions";
import { money } from "../finance/money";

export const netWorthService = {
  /**
   * Calculates live total assets, total liabilities, and net worth in target currency.
   */
  async getLiveNetWorthSummary(targetViewCurrency = null) {
    const baseCurrRecord = await db.currencies
      .filter((c) => c.isBase === true)
      .first();
    const systemBaseCurrency = baseCurrRecord ? baseCurrRecord.code : "USD";
    const displayCurrency = targetViewCurrency || systemBaseCurrency;

    const accounts = await db.accounts
      .filter((a) => a.isActive !== false)
      .toArray();

    let totalAssets = 0;
    let totalLiabilities = 0;
    const assetBreakdown = [];
    const liabilityBreakdown = [];

    for (const acc of accounts) {
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
        totalLiabilities = money.add(totalLiabilities, debtInDisplay);

        liabilityBreakdown.push({
          id: acc.id,
          name: acc.name,
          type: acc.type,
          originalBalance: debtAmount,
          originalCurrency: acc.currency,
          balanceInDisplay: debtInDisplay,
        });
      } else {
        totalAssets = money.add(totalAssets, balanceInDisplay);

        assetBreakdown.push({
          id: acc.id,
          name: acc.name,
          type: acc.type,
          originalBalance: balance,
          originalCurrency: acc.currency,
          balanceInDisplay,
        });
      }
    }

    // Add active "i_owe" debt liabilities
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
      const debtInDisplay = money.multiply(debtBal, rateToDisplay);
      totalLiabilities = money.add(totalLiabilities, debtInDisplay);

      liabilityBreakdown.push({
        id: debt.id,
        name: debt.notes || "Personal Debt",
        type: "debt_liability",
        originalBalance: debtBal,
        originalCurrency: debt.currency || "USD",
        balanceInDisplay: debtInDisplay,
      });
    }

    const netWorth = money.subtract(totalAssets, totalLiabilities);

    return {
      displayCurrency,
      systemBaseCurrency,
      totalAssets,
      totalLiabilities,
      netWorth,
      assetBreakdown,
      liabilityBreakdown,
    };
  },

  /**
   * Fetches historical net worth snapshots ordered by date ascending.
   */
  async getSnapshots() {
    const list = await db.netWorthSnapshots.toArray();
    return list.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  },

  /**
   * Captures a manual or automated Net Worth Snapshot for historical tracking.
   */
  async recordSnapshot(notes = "") {
    const live = await this.getLiveNetWorthSummary();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    const snapshotId = `nws_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return await db.transaction(
      "rw",
      [db.netWorthSnapshots, db.auditLogs],
      async () => {
        // Upsert: Overwrite snapshot if one exists for today, else add new
        const existing = await db.netWorthSnapshots
          .where("date")
          .equals(today)
          .first();

        const snapshotRecord = {
          id: existing ? existing.id : snapshotId,
          date: today,
          totalAssets: live.totalAssets,
          totalLiabilities: live.totalLiabilities,
          netWorth: live.netWorth,
          currency: live.systemBaseCurrency,
          notes:
            notes ||
            (existing ? "Updated daily snapshot" : "Manual net worth snapshot"),
          createdAt: existing ? existing.createdAt : now,
          updatedAt: now,
        };

        if (existing) {
          await db.netWorthSnapshots.update(existing.id, snapshotRecord);
        } else {
          await db.netWorthSnapshots.add(snapshotRecord);
        }

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "netWorthSnapshot",
          entityId: snapshotRecord.id,
          action: existing ? "UPDATE" : "CREATE",
          details: `Captured net worth snapshot: ${snapshotRecord.netWorth} ${snapshotRecord.currency}`,
          timestamp: now,
        });

        return snapshotRecord;
      },
    );
  },

  /**
   * Deletes a snapshot by ID.
   */
  async deleteSnapshot(id) {
    return await db.transaction(
      "rw",
      [db.netWorthSnapshots, db.auditLogs],
      async () => {
        await db.netWorthSnapshots.delete(id);
        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "netWorthSnapshot",
          entityId: id,
          action: "DELETE",
          details: `Deleted net worth snapshot ${id}`,
          timestamp: new Date().toISOString(),
        });
      },
    );
  },
};
