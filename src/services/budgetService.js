// src/services/budgetService.js

import db from "../db/database";
import { calculateBudgetUsage } from "../finance/budgets";

export const budgetService = {
  /**
   * Fetch all active budgets with live spending calculations.
   */
  async getBudgets() {
    const list = await db.budgets.toArray();

    return await Promise.all(
      list.map(async (b) => {
        const usage = await calculateBudgetUsage(b);
        return {
          ...b,
          ...usage,
        };
      }),
    );
  },

  /**
   * Create a new Budget entity.
   */
  async createBudget(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Budget name is required.");
    }
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Budget amount must be greater than zero.");
    }

    // 🔒 Enforce Target Scope Validation
    if (!data.categoryId && !data.subcategoryId && !data.tagId) {
      throw new Error(
        "Budget must target at least a Category, Subcategory, or Tag.",
      );
    }

    const trimmedName = data.name.trim();

    // 🔒 Prevent Duplicate Budget Names (Case-Insensitive)
    const existingBudget = await db.budgets
      .filter((b) => b.name.toLowerCase() === trimmedName.toLowerCase())
      .first();

    if (existingBudget) {
      throw new Error(`A budget named "${trimmedName}" already exists.`);
    }

    const now = new Date().toISOString();
    const budgetId = `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return await db.transaction("rw", [db.budgets, db.auditLogs], async () => {
      const newBudget = {
        id: budgetId,
        name: trimmedName,
        amount: Number(data.amount),
        currency: data.currency || "USD",
        period: data.period || "monthly",
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        tagId: data.tagId || null,
        startDate: data.startDate || now.split("T")[0],
        endDate: data.endDate || null,
        rolloverEnabled: Boolean(data.rolloverEnabled),
        createdAt: now,
        updatedAt: now,
      };

      await db.budgets.add(newBudget);

      await db.auditLogs.add({
        id: `log_${Date.now()}`,
        entityType: "budget",
        entityId: budgetId,
        action: "CREATE",
        details: `Created budget "${newBudget.name}" (${newBudget.amount} ${newBudget.currency})`,
        timestamp: now,
      });

      return newBudget;
    });
  },

  /**
   * Update an existing Budget entity.
   */
  async updateBudget(id, data) {
    const existing = await db.budgets.get(id);
    if (!existing) throw new Error("Budget not found.");

    const trimmedName = data.name ? data.name.trim() : existing.name;

    // 🔒 Prevent Duplicate Budget Names (Excluding Current Record)
    const duplicateBudget = await db.budgets
      .filter(
        (b) =>
          b.id !== id && b.name.toLowerCase() === trimmedName.toLowerCase(),
      )
      .first();

    if (duplicateBudget) {
      throw new Error(`Another budget named "${trimmedName}" already exists.`);
    }

    const targetCategoryId =
      data.categoryId !== undefined ? data.categoryId : existing.categoryId;
    const targetSubcategoryId =
      data.subcategoryId !== undefined
        ? data.subcategoryId
        : existing.subcategoryId;
    const targetTagId = data.tagId !== undefined ? data.tagId : existing.tagId;

    if (!targetCategoryId && !targetSubcategoryId && !targetTagId) {
      throw new Error(
        "Budget must target at least a Category, Subcategory, or Tag.",
      );
    }

    const now = new Date().toISOString();

    return await db.transaction("rw", [db.budgets, db.auditLogs], async () => {
      const updatedData = {
        name: trimmedName,
        amount: data.amount ? Number(data.amount) : existing.amount,
        currency: data.currency || existing.currency,
        period: data.period || existing.period,
        categoryId: targetCategoryId || null,
        subcategoryId: targetSubcategoryId || null,
        tagId: targetTagId || null,
        rolloverEnabled:
          data.rolloverEnabled !== undefined
            ? Boolean(data.rolloverEnabled)
            : existing.rolloverEnabled,
        updatedAt: now,
      };

      await db.budgets.update(id, updatedData);

      await db.auditLogs.add({
        id: `log_${Date.now()}`,
        entityType: "budget",
        entityId: id,
        action: "UPDATE",
        details: `Updated budget "${updatedData.name}"`,
        timestamp: now,
      });
    });
  },
  /**
   * Delete Budget.
   */
  async deleteBudget(id) {
    const existing = await db.budgets.get(id);
    if (!existing) throw new Error("Budget not found.");

    const now = new Date().toISOString();

    return await db.transaction("rw", [db.budgets, db.auditLogs], async () => {
      await db.budgets.delete(id);

      await db.auditLogs.add({
        id: `log_${Date.now()}`,
        entityType: "budget",
        entityId: id,
        action: "DELETE",
        details: `Deleted budget ${id}`,
        timestamp: now,
      });
    });
  },
};
