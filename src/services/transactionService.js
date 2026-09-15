// src/services/transactionService.js

import db from "../db/database";
import { money } from "../finance/money";
import { attachmentService } from "./attachmentService";

export const transactionService = {
  /**
   * Get filtered transactions with soft-delete exclusion.
   */
  async getTransactions(filters = {}) {
    let query = db.transactions.filter((t) => t.isDeleted !== true);

    if (filters.accountId) {
      query = query.filter((t) => t.accountId === filters.accountId);
    }
    if (filters.categoryId) {
      query = query.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters.type) {
      query = query.filter((t) => t.type === filters.type);
    }

    const results = await query.toArray();
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Create an Expense, Income, or Refund transaction.
   */
  async createTransaction(data, rawFiles = []) {
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Transaction amount must be greater than zero.");
    }
    if (!data.accountId) {
      throw new Error("Account is required.");
    }
    if (data.type === "expense" && !data.categoryId) {
      throw new Error("Category is required for expenses.");
    }

    const targetAccount = await db.accounts.get(data.accountId);
    if (!targetAccount) {
      throw new Error("Selected account does not exist.");
    }

    const now = new Date().toISOString();
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Prepare base64 attachment records in memory BEFORE opening Dexie transaction
    const attachmentRecords = await attachmentService.prepareAttachmentRecords(
      transactionId,
      rawFiles,
    );

    const numAmount = Number(data.amount);
    let feeAmount = 0;
    if (data.type === "expense" && data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(numAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const totalAccountImpact = money.add(numAmount, feeAmount);

    const newTransaction = {
      id: transactionId,
      type: data.type,
      date: data.date || now.split("T")[0],
      time: data.time || "12:00",
      amount: numAmount,
      currency: targetAccount.currency,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      subcategoryId: data.subcategoryId || null,
      personEntityId: data.personEntityId || null,
      tags: data.tags || [],
      description: data.description ? data.description.trim() : "",
      notes: data.notes ? data.notes.trim() : "",
      originalTransactionId: data.originalTransactionId || null,
      feeAmount: feeAmount,
      totalImpact: totalAccountImpact,
      status: "completed",
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };

    const lines = [
      {
        id: `txl_${Date.now()}_1`,
        transactionId,
        accountId: data.accountId,
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        type: data.type,
        amount: numAmount,
        currency: targetAccount.currency,
        isDeleted: false,
      },
    ];

    if (feeAmount > 0) {
      lines.push({
        id: `txl_${Date.now()}_fee`,
        transactionId,
        accountId: data.accountId,
        categoryId: "cat_fees",
        subcategoryId: "sub_payment_fees",
        type: "expense",
        amount: feeAmount,
        currency: targetAccount.currency,
        isDeleted: false,
      });
    }

    const auditLog = {
      id: `log_${Date.now()}`,
      entityType: "transaction",
      entityId: transactionId,
      action: "CREATE",
      details: `Created ${data.type} of ${numAmount} ${targetAccount.currency}`,
      timestamp: now,
    };

    // 2. Perform database writes inside atomic Dexie transaction
    return await db.transaction(
      "rw",
      [db.transactions, db.transactionLines, db.attachments, db.auditLogs],
      async () => {
        await db.transactions.add(newTransaction);
        await db.transactionLines.bulkAdd(lines);
        await db.auditLogs.add(auditLog);

        if (attachmentRecords.length > 0) {
          await db.attachments.bulkAdd(attachmentRecords);
        }

        return newTransaction;
      },
    );
  },

  /**
   * Update an existing transaction atomically along with attachment modifications.
   */
  async updateTransaction(
    id,
    data,
    newRawFiles = [],
    attachmentsToDelete = [],
  ) {
    const existing = await db.transactions.get(id);
    if (!existing) {
      throw new Error("Transaction to edit does not exist.");
    }

    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Transaction amount must be greater than zero.");
    }
    if (!data.accountId) {
      throw new Error("Account is required.");
    }

    const targetAccount = await db.accounts.get(data.accountId);
    if (!targetAccount) {
      throw new Error("Selected account does not exist.");
    }

    // 1. Prepare base64 attachment records BEFORE transaction
    const newAttachmentRecords =
      await attachmentService.prepareAttachmentRecords(id, newRawFiles);

    const now = new Date().toISOString();
    const numAmount = Number(data.amount);

    let feeAmount = 0;
    if (data.type === "expense" && data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(numAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const totalAccountImpact = money.add(numAmount, feeAmount);

    const updatedTransaction = {
      ...existing,
      type: data.type,
      date: data.date,
      amount: numAmount,
      currency: targetAccount.currency,
      accountId: data.accountId,
      categoryId: data.categoryId || null,
      subcategoryId: data.subcategoryId || null,
      tags: data.tags || [],
      description: data.description ? data.description.trim() : "",
      feeAmount: feeAmount,
      totalImpact: totalAccountImpact,
      updatedAt: now,
    };

    // 2. Perform atomic updates
    return await db.transaction(
      "rw",
      [db.transactions, db.transactionLines, db.attachments, db.auditLogs],
      async () => {
        // Remove previous ledger lines
        const oldLines = await db.transactionLines
          .where("transactionId")
          .equals(id)
          .toArray();
        const oldLineIds = oldLines.map((l) => l.id);
        if (oldLineIds.length > 0) {
          await db.transactionLines.bulkDelete(oldLineIds);
        }

        const newLines = [
          {
            id: `txl_${Date.now()}_1`,
            transactionId: id,
            accountId: data.accountId,
            categoryId: data.categoryId || null,
            subcategoryId: data.subcategoryId || null,
            type: data.type,
            amount: numAmount,
            currency: targetAccount.currency,
            isDeleted: false,
          },
        ];

        if (feeAmount > 0) {
          newLines.push({
            id: `txl_${Date.now()}_fee`,
            transactionId: id,
            accountId: data.accountId,
            categoryId: "cat_fees",
            subcategoryId: "sub_payment_fees",
            type: "expense",
            amount: feeAmount,
            currency: targetAccount.currency,
            isDeleted: false,
          });
        }

        const auditLog = {
          id: `log_${Date.now()}`,
          entityType: "transaction",
          entityId: id,
          action: "UPDATE",
          details: `Updated ${data.type} to ${numAmount} ${targetAccount.currency}`,
          timestamp: now,
        };

        await db.transactions.put(updatedTransaction);
        await db.transactionLines.bulkAdd(newLines);
        await db.auditLogs.add(auditLog);

        // Delete specified attachments
        if (attachmentsToDelete && attachmentsToDelete.length > 0) {
          for (const attId of attachmentsToDelete) {
            await attachmentService.deleteAttachment(attId);
          }
        }

        // Add new attachment records
        if (newAttachmentRecords.length > 0) {
          await db.attachments.bulkAdd(newAttachmentRecords);
        }

        return updatedTransaction;
      },
    );
  },

  /**
   * Soft delete transaction and clean up associated attachments.
   */
  async deleteTransaction(id) {
    const existing = await db.transactions.get(id);
    if (!existing) throw new Error("Transaction not found.");

    const now = new Date().toISOString();

    return await db.transaction(
      "rw",
      [db.transactions, db.transactionLines, db.attachments, db.auditLogs],
      async () => {
        await db.transactions.update(id, { isDeleted: true, updatedAt: now });

        const lines = await db.transactionLines
          .where("transactionId")
          .equals(id)
          .toArray();
        for (const line of lines) {
          await db.transactionLines.update(line.id, { isDeleted: true });
        }

        const attachments = await db.attachments
          .where("transactionId")
          .equals(id)
          .toArray();
        for (const att of attachments) {
          await db.attachments.delete(att.id);
        }

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "transaction",
          entityId: id,
          action: "DELETE",
          details: `Soft-deleted transaction ${id} and removed associated attachments`,
          timestamp: now,
        });
      },
    );
  },
};
