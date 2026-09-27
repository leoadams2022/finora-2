// src/services/transferService.js
import db from "../db/database";
import { money } from "../finance/money";
import { validateSufficientFunds } from "../utils/validation";
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
    const rawSourceAmount = Number(data.sourceAmount);

    // Fee calculations
    let feeAmount = 0;
    if (data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(rawSourceAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const isFeeInclusive = data.hasFee && data.feeDeductionType === "inclusive";

    if (isFeeInclusive && feeAmount >= rawSourceAmount) {
      throw new Error(
        "Transfer fee cannot exceed or equal the total transfer amount.",
      );
    }

    // Effective net amount sent to destination account
    const netSourceTransferAmount = isFeeInclusive
      ? money.subtract(rawSourceAmount, feeAmount)
      : rawSourceAmount;

    let exchangeRate = 1.0;
    let numDestAmount = netSourceTransferAmount;

    if (isCrossCurrency) {
      if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
        throw new Error(
          "Valid exchange rate is required for cross-currency transfers.",
        );
      }
      exchangeRate = Number(data.exchangeRate);
      numDestAmount = data.destinationAmount
        ? Number(data.destinationAmount)
        : money.multiply(netSourceTransferAmount, exchangeRate);
    }

    const totalSourceDebit =
      data.hasFee && data.feeDeductionType === "additive"
        ? money.add(rawSourceAmount, feeAmount)
        : rawSourceAmount;

    await validateSufficientFunds({
      accountId: sourceAcc.id,
      outgoingAmount: totalSourceDebit,
    });

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
          amount: rawSourceAmount,
          currency: sourceAcc.currency,
          accountId: sourceAcc.id,
          destinationAccountId: destAcc.id,
          destinationAmount: numDestAmount,
          destinationCurrency: destAcc.currency,
          exchangeRate: exchangeRate,
          feeAmount: feeAmount,
          feeCurrency: sourceAcc.currency,
          feeDeductionType: data.feeDeductionType || "additive",
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
          // 1. Source Account Debit (Net transferred portion)
          {
            id: `txl_${Date.now()}_src`,
            transactionId: transferId,
            accountId: sourceAcc.id,
            type: "expense",
            amount: netSourceTransferAmount,
            currency: sourceAcc.currency,
            isDeleted: false,
          },
          // 2. Destination Account Credit (Amount received after conversion/fees)
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
          details: `Transferred ${netSourceTransferAmount} ${sourceAcc.currency} to ${destAcc.name} (${numDestAmount} ${destAcc.currency}) [Fee: ${feeAmount} ${sourceAcc.currency} (${data.feeDeductionType || "additive"})]`,
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
   * Update existing Transfer atomically.
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
    const rawSourceAmount = Number(data.sourceAmount);

    let feeAmount = 0;
    if (data.hasFee) {
      if (data.feeType === "percentage") {
        feeAmount = money.calculatePercentageFee(rawSourceAmount, data.feeRate);
      } else {
        feeAmount = Number(data.feeAmount || 0);
      }
    }

    const isFeeInclusive = data.hasFee && data.feeDeductionType === "inclusive";

    if (isFeeInclusive && feeAmount >= rawSourceAmount) {
      throw new Error(
        "Transfer fee cannot exceed or equal the total transfer amount.",
      );
    }

    const netSourceTransferAmount = isFeeInclusive
      ? money.subtract(rawSourceAmount, feeAmount)
      : rawSourceAmount;

    let exchangeRate = 1.0;
    let numDestAmount = netSourceTransferAmount;

    if (isCrossCurrency) {
      if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
        throw new Error(
          "Valid exchange rate is required for cross-currency transfers.",
        );
      }
      exchangeRate = Number(data.exchangeRate);
      numDestAmount = data.destinationAmount
        ? Number(data.destinationAmount)
        : money.multiply(netSourceTransferAmount, exchangeRate);
    }

    const totalSourceDebit =
      data.hasFee && data.feeDeductionType === "additive"
        ? money.add(rawSourceAmount, feeAmount)
        : rawSourceAmount;

    await validateSufficientFunds({
      accountId: sourceAcc.id,
      outgoingAmount: totalSourceDebit,
      excludeTransactionId: id,
    });

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
          amount: rawSourceAmount,
          currency: sourceAcc.currency,
          accountId: sourceAcc.id,
          destinationAccountId: destAcc.id,
          destinationAmount: numDestAmount,
          destinationCurrency: destAcc.currency,
          exchangeRate: exchangeRate,
          feeAmount: feeAmount,
          feeCurrency: sourceAcc.currency,
          feeDeductionType: data.feeDeductionType || "additive",
          description: data.description
            ? data.description.trim()
            : `Transfer to ${destAcc.name}`,
          tags: data.tags || [],
          updatedAt: now,
        };

        const oldLines = await db.transactionLines
          .where("transactionId")
          .equals(id)
          .toArray();
        for (const line of oldLines) {
          await db.transactionLines.update(line.id, { isDeleted: true });
        }

        const newLines = [
          {
            id: `txl_${Date.now()}_src`,
            transactionId: id,
            accountId: sourceAcc.id,
            type: "expense",
            amount: netSourceTransferAmount,
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

        for (const attId of attachmentsToDelete) {
          await db.attachments.delete(attId);
        }
        if (newAttachmentRecords.length > 0) {
          await db.attachments.bulkAdd(newAttachmentRecords);
        }

        const auditLog = {
          id: `log_${Date.now()}`,
          entityType: "transfer",
          entityId: id,
          action: "UPDATE",
          details: `Updated transfer ${id}: ${netSourceTransferAmount} ${sourceAcc.currency} to ${destAcc.name}`,
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
   * Delete Transfer (Soft Delete).
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
