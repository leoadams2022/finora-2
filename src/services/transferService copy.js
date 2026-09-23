// src/services/transferService.js
import db from "../db/database";
import { money } from "../finance/money";
import { attachmentService } from "./attachmentService";

export const transferService = {
  /**
   * Fetch active transfers.
   */
  async getTransfers(filters = {}) {
    let collection = db.transactions.filter(
      (t) => t.isDeleted !== true && t.type === "transfer",
    );

    if (filters.sourceAccountId) {
      collection = collection.filter(
        (t) => t.accountId === filters.sourceAccountId,
      );
    }
    if (filters.destinationAccountId) {
      collection = collection.filter(
        (t) => t.destinationAccountId === filters.destinationAccountId,
      );
    }

    const list = await collection.toArray();
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  /**
   * Create Same-Currency or Cross-Currency Transfer atomically with optional attachments.
   */
  async createTransfer(data, rawFiles = []) {
    if (!data.sourceAccountId || !data.destinationAccountId) {
      throw new Error("Both source and destination accounts are required.");
    }
    if (data.sourceAccountId === data.destinationAccountId) {
      throw new Error(
        "Source and destination accounts cannot be the same account.",
      );
    }
    if (!data.sourceAmount || Number(data.sourceAmount) <= 0) {
      throw new Error("Transfer amount must be greater than zero.");
    }

    const sourceAcc = await db.accounts.get(data.sourceAccountId);
    const destAcc = await db.accounts.get(data.destinationAccountId);

    if (!sourceAcc || !destAcc) {
      throw new Error("Selected accounts could not be found.");
    }

    const isCrossCurrency = sourceAcc.currency !== destAcc.currency;
    const numSourceAmount = Number(data.sourceAmount);

    let numDestAmount = numSourceAmount;
    let exchangeRate = 1.0;

    if (isCrossCurrency) {
      if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
        throw new Error(
          "Valid exchange rate is required for cross-currency transfers.",
        );
      }
      exchangeRate = Number(data.exchangeRate);
      numDestAmount = data.destinationAmount
        ? Number(data.destinationAmount)
        : money.multiply(numSourceAmount, exchangeRate);
    }

    // Fee calculations
    let feeAmount = 0;
    if (data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(numSourceAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const transferId = `trf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Prepare base64 attachment records in memory BEFORE Dexie transaction
    const attachmentRecords = await attachmentService.prepareAttachmentRecords(
      transferId,
      rawFiles,
    );

    return await db.transaction(
      "rw",
      [db.transactions, db.transactionLines, db.attachments, db.auditLogs],
      async () => {
        const now = new Date().toISOString();

        const newTransferHeader = {
          id: transferId,
          type: "transfer",
          isTransferTransaction: true,
          date: data.date || now,
          time: data.time || "12:00",
          amount: numSourceAmount,
          currency: sourceAcc.currency,
          accountId: sourceAcc.id, // Source account
          destinationAccountId: destAcc.id, // Destination account
          destinationAmount: numDestAmount,
          destinationCurrency: destAcc.currency,
          exchangeRate: exchangeRate,
          feeAmount: feeAmount,
          feeCurrency: sourceAcc.currency,
          description: data.description
            ? data.description.trim()
            : `Transfer to ${destAcc.name}`,
          tags: data.tags || [],
          status: "completed",
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };

        const lines = [
          // 1. Source Account Debit (Expense Line Effect)
          {
            id: `txl_${Date.now()}_src`,
            transactionId: transferId,
            accountId: sourceAcc.id,
            type: "expense",
            amount: numSourceAmount,
            currency: sourceAcc.currency,
            isDeleted: false,
          },
          // 2. Destination Account Credit (Income Line Effect)
          {
            id: `txl_${Date.now()}_dest`,
            transactionId: transferId,
            accountId: destAcc.id,
            type: "income",
            amount: numDestAmount,
            currency: destAcc.currency,
            isDeleted: false,
          },
        ];

        // 3. Fee Expense Line (If applicable)
        if (feeAmount > 0) {
          lines.push({
            id: `txl_${Date.now()}_fee`,
            transactionId: transferId,
            accountId: sourceAcc.id,
            categoryId: "cat_fees",
            subcategoryId: "sub_transfer_fees",
            type: "expense",
            amount: feeAmount,
            currency: sourceAcc.currency,
            isDeleted: false,
          });
        }

        const auditLog = {
          id: `log_${Date.now()}`,
          entityType: "transfer",
          entityId: transferId,
          action: "CREATE",
          details: `Transferred ${numSourceAmount} ${sourceAcc.currency} to ${destAcc.name} (${numDestAmount} ${destAcc.currency})`,
          timestamp: now,
        };

        await db.transactions.add(newTransferHeader);
        await db.transactionLines.bulkAdd(lines);
        await db.auditLogs.add(auditLog);

        if (attachmentRecords.length > 0) {
          await db.attachments.bulkAdd(attachmentRecords);
        }

        return newTransferHeader;
      },
    );
  },

  /**
   * Update existing Transfer atomically with ledger line replacement and attachment management.
   */
  async updateTransfer(id, data, newRawFiles = [], attachmentsToDelete = []) {
    const existing = await db.transactions.get(id);
    if (!existing || existing.isDeleted) {
      throw new Error("Transfer record not found.");
    }

    if (!data.sourceAccountId || !data.destinationAccountId) {
      throw new Error("Both source and destination accounts are required.");
    }
    if (data.sourceAccountId === data.destinationAccountId) {
      throw new Error(
        "Source and destination accounts cannot be the same account.",
      );
    }
    if (!data.sourceAmount || Number(data.sourceAmount) <= 0) {
      throw new Error("Transfer amount must be greater than zero.");
    }

    const sourceAcc = await db.accounts.get(data.sourceAccountId);
    const destAcc = await db.accounts.get(data.destinationAccountId);

    if (!sourceAcc || !destAcc) {
      throw new Error("Selected accounts could not be found.");
    }

    const isCrossCurrency = sourceAcc.currency !== destAcc.currency;
    const numSourceAmount = Number(data.sourceAmount);

    let numDestAmount = numSourceAmount;
    let exchangeRate = 1.0;

    if (isCrossCurrency) {
      if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
        throw new Error(
          "Valid exchange rate is required for cross-currency transfers.",
        );
      }
      exchangeRate = Number(data.exchangeRate);
      numDestAmount = data.destinationAmount
        ? Number(data.destinationAmount)
        : money.multiply(numSourceAmount, exchangeRate);
    }

    let feeAmount = 0;
    if (data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(numSourceAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const newAttachmentRecords =
      await attachmentService.prepareAttachmentRecords(id, newRawFiles);

    return await db.transaction(
      "rw",
      [db.transactions, db.transactionLines, db.attachments, db.auditLogs],
      async () => {
        const now = new Date().toISOString();

        const updatedTransferHeader = {
          ...existing,
          date: data.date || existing.date,
          time: data.time || existing.time || "12:00",
          amount: numSourceAmount,
          currency: sourceAcc.currency,
          accountId: sourceAcc.id,
          destinationAccountId: destAcc.id,
          destinationAmount: numDestAmount,
          destinationCurrency: destAcc.currency,
          exchangeRate: exchangeRate,
          feeAmount: feeAmount,
          feeCurrency: sourceAcc.currency,
          description: data.description
            ? data.description.trim()
            : `Transfer to ${destAcc.name}`,
          tags: data.tags || [],
          updatedAt: now,
        };

        // Mark existing transaction lines as deleted
        const oldLines = await db.transactionLines
          .where("transactionId")
          .equals(id)
          .toArray();
        for (const line of oldLines) {
          await db.transactionLines.update(line.id, { isDeleted: true });
        }

        // Create new ledger lines
        const newLines = [
          {
            id: `txl_${Date.now()}_src`,
            transactionId: id,
            accountId: sourceAcc.id,
            type: "expense",
            amount: numSourceAmount,
            currency: sourceAcc.currency,
            isDeleted: false,
          },
          {
            id: `txl_${Date.now()}_dest`,
            transactionId: id,
            accountId: destAcc.id,
            type: "income",
            amount: numDestAmount,
            currency: destAcc.currency,
            isDeleted: false,
          },
        ];

        if (feeAmount > 0) {
          newLines.push({
            id: `txl_${Date.now()}_fee`,
            transactionId: id,
            accountId: sourceAcc.id,
            categoryId: "cat_fees",
            subcategoryId: "sub_transfer_fees",
            type: "expense",
            amount: feeAmount,
            currency: sourceAcc.currency,
            isDeleted: false,
          });
        }

        // Handle attachment additions and removals
        for (const attId of attachmentsToDelete) {
          await db.attachments.delete(attId);
        }
        if (newAttachmentRecords.length > 0) {
          await db.attachments.bulkAdd(newAttachmentRecords);
        }

        // Write Audit Log
        const auditLog = {
          id: `log_${Date.now()}`,
          entityType: "transfer",
          entityId: id,
          action: "UPDATE",
          details: `Updated transfer ${id}: ${numSourceAmount} ${sourceAcc.currency} to ${destAcc.name}`,
          timestamp: now,
        };

        await db.transactions.put(updatedTransferHeader);
        await db.transactionLines.bulkAdd(newLines);
        await db.auditLogs.add(auditLog);

        return updatedTransferHeader;
      },
    );
  },

  /**
   * Delete Transfer (Soft Delete) and clean up associated attachments.
   */
  async deleteTransfer(id) {
    const existing = await db.transactions.get(id);
    if (!existing) throw new Error("Transfer record not found.");

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
          entityType: "transfer",
          entityId: id,
          action: "DELETE",
          details: `Soft-deleted transfer ${id} and removed associated attachments`,
          timestamp: now,
        });
      },
    );
  },
};
