// src/services/debtService.js
import db from "../db/database";
import { money } from "../finance/money";
import { calculateDebtBalance } from "../finance/debts";
import { attachmentService } from "./attachmentService";

export const debtService = {
  async getDebts(filters = {}) {
    let collection = db.debts.filter((d) => d.isDeleted !== true);

    if (filters.direction) {
      collection = collection.filter((d) => d.direction === filters.direction);
    }
    if (filters.personEntityId) {
      collection = collection.filter(
        (d) => d.personEntityId === filters.personEntityId,
      );
    }

    const list = await collection.toArray();

    return await Promise.all(
      list.map(async (debt) => {
        const stats = await calculateDebtBalance(debt.id);
        return {
          ...debt,
          ...stats,
        };
      }),
    );
  },

  /**
   * Create Debt with optional cross-currency cash-flow handling and attachments
   */
  async createDebt(data, rawFiles = []) {
    if (!data.personEntityId) throw new Error("Person or entity is required.");
    if (!data.originalAmount || Number(data.originalAmount) <= 0) {
      throw new Error("Original debt amount must be greater than zero.");
    }

    const now = new Date().toISOString();
    const debtId = `debt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const numDebtAmount = Number(data.originalAmount);

    // Prepare base64 attachment records in memory BEFORE Dexie transaction
    const attachmentRecords = await attachmentService.prepareAttachmentRecords(
      debtId,
      rawFiles,
    );

    return await db.transaction(
      "rw",
      [
        db.accounts,
        db.debts,
        db.transactions,
        db.transactionLines,
        db.attachments,
        db.auditLogs,
      ],
      async () => {
        let debtTransactionId = null;
        let debtTransactionLineId = null;

        // Record Account Cash Flow
        if (data.accountId) {
          const acc = await db.accounts.get(data.accountId);
          if (acc) {
            const isCrossCurrency = acc.currency !== data.currency;
            let exchangeRate = 1.0;
            let accountAmount = numDebtAmount;

            if (isCrossCurrency) {
              if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
                throw new Error(
                  "Exchange rate is required for cross-currency accounts.",
                );
              }
              exchangeRate = Number(data.exchangeRate);
              accountAmount = data.accountAmount
                ? Number(data.accountAmount)
                : money.multiply(numDebtAmount, exchangeRate);
            }

            const txId = `tx_${debtId}_init`;
            const isIOwe = data.direction === "i_owe";
            const txType = isIOwe ? "income" : "expense";

            const txHeader = {
              id: txId,
              debtId,
              isDebtTransaction: true,
              type: txType,
              date: data.startDate || now,
              amount: accountAmount,
              currency: acc.currency,
              debtCurrencyAmount: numDebtAmount,
              debtCurrency: data.currency,
              exchangeRate: exchangeRate,
              accountId: acc.id,
              personEntityId: data.personEntityId,
              description: isIOwe ? "Borrowed funds" : "Lent funds",
              feeAmount: 0,
              totalImpact: accountAmount,
              status: "completed",
              isDeleted: false,
              createdAt: now,
              updatedAt: now,
            };

            const txl = {
              id: `txl_${txId}_1`,
              transactionId: txId,
              accountId: acc.id,
              type: txType,
              amount: accountAmount,
              currency: acc.currency,
              isDeleted: false,
            };

            debtTransactionId = await db.transactions.add(txHeader);
            debtTransactionLineId = await db.transactionLines.add(txl);
          }
        }

        const newDebt = {
          id: debtId,
          debtTransactionId,
          debtTransactionLineId,
          direction: data.direction || "i_owe",
          personEntityId: data.personEntityId,
          originalAmount: numDebtAmount,
          currency: data.currency || "USD",
          categoryId: data.categoryId || null,
          subcategoryId: data.subcategoryId || null,
          startDate: data.startDate || now,
          dueDate: data.dueDate || null,
          interestRate: Number(data.interestRate || 0),
          tags: data.tags || [],
          notes: data.notes ? data.notes.trim() : "",
          accountId: data.accountId || null,
          status: "active",
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };

        await db.debts.add(newDebt);

        // Save prepared attachments synchronously inside transaction
        if (attachmentRecords.length > 0) {
          await db.attachments.bulkAdd(attachmentRecords);
        }

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "debt",
          entityId: debtId,
          action: "CREATE",
          details: `Created debt of ${numDebtAmount} ${data.currency}`,
          timestamp: now,
        });

        return newDebt;
      },
    );
  },

  /**
   * Record Debt Payment with cross-currency support
   */
  async recordDebtPayment(data) {
    if (!data.debtId) throw new Error("Debt ID is required.");
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Payment amount must be greater than zero.");
    }
    if (!data.accountId) throw new Error("Payment account is required.");

    const debt = await db.debts.get(data.debtId);
    if (!debt) throw new Error("Debt not found.");

    const stats = await calculateDebtBalance(debt.id);
    const numPaymentDebtCurrency = Number(data.amount);

    if (numPaymentDebtCurrency > stats.remainingBalance) {
      throw new Error(
        `Payment amount cannot exceed remaining balance of ${stats.remainingBalance} ${debt.currency}.`,
      );
    }

    return await db.transaction(
      "rw",
      [
        db.accounts,
        db.debts,
        db.debtPayments,
        db.transactions,
        db.transactionLines,
        db.auditLogs,
      ],
      async () => {
        const acc = await db.accounts.get(data.accountId);
        if (!acc) throw new Error("Account not found.");

        const isCrossCurrency = acc.currency !== debt.currency;
        let exchangeRate = 1.0;
        let accountAmount = numPaymentDebtCurrency;

        if (isCrossCurrency) {
          if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
            throw new Error(
              "Exchange rate is required when paying from a different currency account.",
            );
          }
          exchangeRate = Number(data.exchangeRate);
          accountAmount = data.accountAmount
            ? Number(data.accountAmount)
            : money.multiply(numPaymentDebtCurrency, exchangeRate);
        }

        const now = new Date().toISOString();
        const paymentId = `dp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const txId = `tx_${paymentId}`;

        const debtPayment = {
          id: paymentId,
          debtId: debt.id,
          transactionId: txId,
          amount: numPaymentDebtCurrency,
          accountAmount: accountAmount,
          currency: debt.currency,
          accountCurrency: acc.currency,
          exchangeRate: exchangeRate,
          accountId: acc.id,
          date: data.date || now,
          notes: data.notes ? data.notes.trim() : "",
          isDeleted: false,
          createdAt: now,
        };

        const isIOwe = debt.direction === "i_owe";
        const lineType = isIOwe ? "expense" : "income";

        const txHeader = {
          id: txId,
          type: "debt_payment",
          date: data.date || now,
          amount: accountAmount,
          currency: acc.currency,
          accountId: acc.id,
          description: isIOwe ? "Debt Payment Made" : "Debt Payment Received",
          status: "completed",
          isDeleted: false,
          createdAt: now,
        };

        const txl = {
          id: `txl_${txId}_1`,
          transactionId: txId,
          accountId: acc.id,
          type: lineType,
          amount: accountAmount,
          currency: acc.currency,
          isDeleted: false,
        };

        await db.debtPayments.add(debtPayment);
        await db.transactions.add(txHeader);
        await db.transactionLines.add(txl);

        const newRemaining = money.subtract(
          stats.remainingBalance,
          numPaymentDebtCurrency,
        );
        const newStatus = newRemaining === 0 ? "paid" : "partially_paid";
        await db.debts.update(debt.id, { status: newStatus, updatedAt: now });

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "debt_payment",
          entityId: paymentId,
          action: "CREATE",
          details: `Recorded debt payment of ${numPaymentDebtCurrency} ${debt.currency} using account ${acc.name}`,
          timestamp: now,
        });

        return debtPayment;
      },
    );
  },

  /**
   * Update Debt record, sync linked cash flow transactions, and update attachments
   */
  async updateDebt(id, data, newRawFiles = [], attachmentsToDelete = []) {
    const existing = await db.debts.get(id);
    if (!existing || existing.isDeleted) {
      throw new Error("Debt record not found.");
    }

    if (!data.personEntityId) throw new Error("Person or entity is required.");
    if (!data.originalAmount || Number(data.originalAmount) <= 0) {
      throw new Error("Original debt amount must be greater than zero.");
    }

    const now = new Date().toISOString();
    const numDebtAmount = Number(data.originalAmount);

    const newAttachmentRecords =
      await attachmentService.prepareAttachmentRecords(id, newRawFiles);

    return await db.transaction(
      "rw",
      [
        db.accounts,
        db.debts,
        db.transactions,
        db.transactionLines,
        db.attachments,
        db.auditLogs,
      ],
      async () => {
        let debtTransactionId = existing.debtTransactionId;
        let debtTransactionLineId = existing.debtTransactionLineId;

        // Handle linked Account Cash Flow Transaction updates or additions
        if (data.accountId) {
          const acc = await db.accounts.get(data.accountId);
          if (acc) {
            const isCrossCurrency = acc.currency !== data.currency;
            let exchangeRate = 1.0;
            let accountAmount = numDebtAmount;

            if (isCrossCurrency) {
              if (!data.exchangeRate || Number(data.exchangeRate) <= 0) {
                throw new Error(
                  "Exchange rate is required for cross-currency accounts.",
                );
              }
              exchangeRate = Number(data.exchangeRate);
              accountAmount = data.accountAmount
                ? Number(data.accountAmount)
                : money.multiply(numDebtAmount, exchangeRate);
            }

            const isIOwe = data.direction === "i_owe";
            const txType = isIOwe ? "income" : "expense";
            const txId = debtTransactionId || `tx_${id}_init`;

            const txHeader = {
              id: txId,
              debtId: id,
              isDebtTransaction: true,
              type: txType,
              date: data.startDate || now,
              amount: accountAmount,
              currency: acc.currency,
              debtCurrencyAmount: numDebtAmount,
              debtCurrency: data.currency,
              exchangeRate: exchangeRate,
              accountId: acc.id,
              personEntityId: data.personEntityId,
              description: isIOwe ? "Borrowed funds" : "Lent funds",
              feeAmount: 0,
              totalImpact: accountAmount,
              status: "completed",
              isDeleted: false,
              createdAt: existing.createdAt,
              updatedAt: now,
            };

            const txlId = debtTransactionLineId || `txl_${txId}_1`;
            const txl = {
              id: txlId,
              transactionId: txId,
              accountId: acc.id,
              type: txType,
              amount: accountAmount,
              currency: acc.currency,
              isDeleted: false,
            };

            await db.transactions.put(txHeader);
            await db.transactionLines.put(txl);

            debtTransactionId = txId;
            debtTransactionLineId = txlId;
          }
        } else if (existing.debtTransactionId) {
          // If linked account was removed, soft-delete existing initial cash flow transaction
          await db.transactions.update(existing.debtTransactionId, {
            isDeleted: true,
            updatedAt: now,
          });

          const txls = await db.transactionLines
            .where("transactionId")
            .equals(existing.debtTransactionId)
            .toArray();

          for (const line of txls) {
            await db.transactionLines.update(line.id, { isDeleted: true });
          }

          debtTransactionId = null;
          debtTransactionLineId = null;
        }

        const updatedDebt = {
          ...existing,
          debtTransactionId,
          debtTransactionLineId,
          direction: data.direction || existing.direction,
          personEntityId: data.personEntityId,
          originalAmount: numDebtAmount,
          currency: data.currency || existing.currency,
          categoryId: data.categoryId || null,
          subcategoryId: data.subcategoryId || null,
          startDate: data.startDate || existing.startDate,
          dueDate: data.dueDate || null,
          interestRate: Number(data.interestRate || 0),
          tags: data.tags || [],
          notes: data.notes ? data.notes.trim() : "",
          accountId: data.accountId || null,
          updatedAt: now,
        };

        await db.debts.put(updatedDebt);

        // Attachment updates
        for (const attId of attachmentsToDelete) {
          await db.attachments.delete(attId);
        }
        if (newAttachmentRecords.length > 0) {
          await db.attachments.bulkAdd(newAttachmentRecords);
        }

        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "debt",
          entityId: id,
          action: "UPDATE",
          details: `Updated debt record ${id}: ${numDebtAmount} ${data.currency}`,
          timestamp: now,
        });

        return updatedDebt;
      },
    );
  },

  /**
   * Delete debt and soft-delete its initial account transaction, payment transactions, and attachments.
   */
  async deleteDebt(id) {
    const existing = await db.debts.get(id);
    if (!existing) throw new Error("Debt record not found.");

    const now = new Date().toISOString();

    return await db.transaction(
      "rw",
      [
        db.debts,
        db.debtPayments,
        db.attachments,
        db.auditLogs,
        db.transactions,
        db.transactionLines,
      ],
      async () => {
        // 1. Soft-delete the debt
        await db.debts.update(id, { isDeleted: true, updatedAt: now });

        // 2. Soft-delete associated debt payments and their corresponding transactions
        const payments = await db.debtPayments
          .where("debtId")
          .equals(id)
          .toArray();

        for (const p of payments) {
          await db.debtPayments.update(p.id, { isDeleted: true });

          if (p.transactionId) {
            await db.transactions.update(p.transactionId, {
              isDeleted: true,
              updatedAt: now,
            });

            const paymentTxls = await db.transactionLines
              .where("transactionId")
              .equals(p.transactionId)
              .toArray();

            for (const line of paymentTxls) {
              await db.transactionLines.update(line.id, { isDeleted: true });
            }
          }
        }

        // 3. Soft-delete initial linked account transaction (if cash flow was recorded upon debt creation)
        const initTxId = existing.debtTransactionId || `tx_${id}_init`;
        const initTx = await db.transactions.get(initTxId);
        if (initTx) {
          await db.transactions.update(initTx.id, {
            isDeleted: true,
            updatedAt: now,
          });

          const initTxls = await db.transactionLines
            .where("transactionId")
            .equals(initTx.id)
            .toArray();

          for (const line of initTxls) {
            await db.transactionLines.update(line.id, { isDeleted: true });
          }
        }

        // 4. Clean up attached files for this debt
        const attachments = await db.attachments
          .where("transactionId")
          .equals(id)
          .toArray();

        for (const att of attachments) {
          await db.attachments.delete(att.id);
        }

        // 5. Audit log
        await db.auditLogs.add({
          id: `log_${Date.now()}`,
          entityType: "debt",
          entityId: id,
          action: "DELETE",
          details: `Soft-deleted debt ${id}, its initial cash-flow transactions, payment history, and attachments.`,
          timestamp: now,
        });
      },
    );
  },
};
