// src/services/recurringService.js

import db from "../db/database";

/**
 * Calculates the next occurrence date based on frequency and current target date.
 */
export const calculateNextOccurrenceDate = (
  currentDateStr,
  frequency,
  customIntervalDays = 1,
) => {
  const date = new Date(currentDateStr);
  if (isNaN(date.getTime())) return currentDateStr;

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    case "custom":
      date.setDate(
        date.getDate() + Math.max(1, Number(customIntervalDays || 1)),
      );
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date.toISOString().split("T")[0];
};

export const recurringService = {
  /**
   * Fetch all recurring transaction templates.
   */
  async getRecurringTransactions() {
    return await db.recurringTransactions.toArray();
  },

  /**
   * Create a new Recurring Transaction template.
   */
  async createRecurringTransaction(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Recurring transaction name is required.");
    }
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Amount must be a positive number.");
    }
    if (!data.accountId) {
      throw new Error("Account is required.");
    }
    if (data.type === "expense" && !data.categoryId) {
      throw new Error("Category is required for expenses.");
    }

    const trimmedName = data.name.trim();

    // Prevent duplicate active recurring names
    const existing = await db.recurringTransactions
      .filter(
        (r) =>
          r.status !== "archived" &&
          r.name.toLowerCase() === trimmedName.toLowerCase(),
      )
      .first();

    if (existing) {
      throw new Error(
        `A recurring transaction named "${trimmedName}" already exists.`,
      );
    }

    const now = new Date().toISOString();
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startDate = data.startDate || now.split("T")[0];
    const nextOccurrence = data.nextOccurrence || startDate;

    return await db.transaction(
      "rw",
      [db.recurringTransactions, db.auditLogs],
      async () => {
        const record = {
          id,
          name: trimmedName,
          type: data.type || "expense",
          amount: Number(data.amount),
          currency: data.currency || "USD",
          accountId: data.accountId,
          categoryId: data.categoryId || null,
          subcategoryId: data.subcategoryId || null,
          tags: Array.isArray(data.tags) ? data.tags : [],
          frequency: data.frequency || "monthly",
          customIntervalDays:
            data.frequency === "custom"
              ? Number(data.customIntervalDays || 1)
              : null,
          startDate,
          endDate: data.endDate || null,
          nextOccurrence,
          lastOccurrence: null,
          autoCreate:
            data.autoCreate !== undefined ? Boolean(data.autoCreate) : true,
          status: data.status || "active",
          notes: data.notes || "",
          createdAt: now,
          updatedAt: now,
        };

        await db.recurringTransactions.add(record);

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "recurringTransaction",
          entityId: id,
          action: "CREATE",
          details: `Created recurring transaction rule "${record.name}"`,
          timestamp: now,
        });

        return record;
      },
    );
  },

  /**
   * Update an existing Recurring Transaction template.
   */
  async updateRecurringTransaction(id, data) {
    const existing = await db.recurringTransactions.get(id);
    if (!existing) throw new Error("Recurring transaction rule not found.");

    const trimmedName = data.name ? data.name.trim() : existing.name;

    const duplicate = await db.recurringTransactions
      .filter(
        (r) =>
          r.id !== id &&
          r.status !== "archived" &&
          r.name.toLowerCase() === trimmedName.toLowerCase(),
      )
      .first();

    if (duplicate) {
      throw new Error(
        `Another active recurring rule named "${trimmedName}" already exists.`,
      );
    }

    const now = new Date().toISOString();

    return await db.transaction(
      "rw",
      [db.recurringTransactions, db.auditLogs],
      async () => {
        const updated = {
          name: trimmedName,
          type: data.type || existing.type,
          amount: data.amount ? Number(data.amount) : existing.amount,
          currency: data.currency || existing.currency,
          accountId: data.accountId || existing.accountId,
          categoryId:
            data.categoryId !== undefined
              ? data.categoryId
              : existing.categoryId,
          subcategoryId:
            data.subcategoryId !== undefined
              ? data.subcategoryId
              : existing.subcategoryId,
          tags: Array.isArray(data.tags) ? data.tags : existing.tags,
          frequency: data.frequency || existing.frequency,
          customIntervalDays:
            data.frequency === "custom"
              ? Number(data.customIntervalDays || 1)
              : existing.customIntervalDays,
          startDate: data.startDate || existing.startDate,
          endDate: data.endDate !== undefined ? data.endDate : existing.endDate,
          nextOccurrence: data.nextOccurrence || existing.nextOccurrence,
          autoCreate:
            data.autoCreate !== undefined
              ? Boolean(data.autoCreate)
              : existing.autoCreate,
          status: data.status || existing.status,
          notes: data.notes !== undefined ? data.notes : existing.notes,
          updatedAt: now,
        };

        await db.recurringTransactions.update(id, updated);

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "recurringTransaction",
          entityId: id,
          action: "UPDATE",
          details: `Updated recurring transaction rule "${updated.name}"`,
          timestamp: now,
        });
      },
    );
  },

  /**
   * Evaluates due recurring transactions and generates corresponding ledger entries.
   */
  async processDueRecurringTransactions(
    asOfDateStr = new Date().toISOString().split("T")[0],
  ) {
    const activeRules = await db.recurringTransactions
      .filter((r) => r.status === "active" && r.nextOccurrence <= asOfDateStr)
      .toArray();

    const createdTransactions = [];

    for (const rule of activeRules) {
      if (rule.endDate && rule.nextOccurrence > rule.endDate) {
        await db.recurringTransactions.update(rule.id, {
          status: "completed",
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      await db.transaction(
        "rw",
        [db.recurringTransactions, db.transactions, db.auditLogs],
        async () => {
          const txId = `tx_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const now = new Date().toISOString();

          // Create standard ledger transaction
          const newTx = {
            id: txId,
            type: rule.type,
            date: rule.nextOccurrence,
            description: rule.name,
            amount: rule.amount,
            totalImpact: rule.amount,
            currency: rule.currency,
            accountId: rule.accountId,
            categoryId: rule.categoryId,
            subcategoryId: rule.subcategoryId,
            tags: rule.tags,
            notes: rule.notes
              ? `[Auto-Generated Recurring] ${rule.notes}`
              : "[Auto-Generated Recurring]",
            status: rule.autoCreate ? "completed" : "pending",
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          };

          await db.transactions.add(newTx);
          createdTransactions.push(newTx);

          // Advance next occurrence
          const nextDate = calculateNextOccurrenceDate(
            rule.nextOccurrence,
            rule.frequency,
            rule.customIntervalDays,
          );
          const isCompleted = rule.endDate && nextDate > rule.endDate;

          await db.recurringTransactions.update(rule.id, {
            lastOccurrence: rule.nextOccurrence,
            nextOccurrence: nextDate,
            status: isCompleted ? "completed" : "active",
            updatedAt: now,
          });

          await db.auditLogs.add({
            id: `log_${Date.now()}`,
            entityType: "recurringTransaction",
            entityId: rule.id,
            action: "EXECUTE",
            details: `Generated transaction ${txId} for rule "${rule.name}"`,
            timestamp: now,
          });
        },
      );
    }

    return createdTransactions;
  },

  /**
   * Delete or archive a recurring transaction rule.
   */
  async deleteRecurringTransaction(id) {
    const existing = await db.recurringTransactions.get(id);
    if (!existing) throw new Error("Recurring rule not found.");

    return await db.transaction(
      "rw",
      [db.recurringTransactions, db.auditLogs],
      async () => {
        await db.recurringTransactions.delete(id);

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "recurringTransaction",
          entityId: id,
          action: "DELETE",
          details: `Deleted recurring transaction rule ${id}`,
          timestamp: new Date().toISOString(),
        });
      },
    );
  },
};
