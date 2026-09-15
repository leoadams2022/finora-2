// src/services/auditService.js

import db from "../db/database";

export const auditService = {
  /**
   * Fetches unified audit history across all financial operations.
   */
  async getAuditHistory(filters = {}) {
    const [transactions, debts, debtPayments, accounts, people, categories] =
      await Promise.all([
        db.transactions.toArray(),
        db.debts.toArray(),
        db.debtPayments.toArray(),
        db.accounts.toArray(),
        db.peopleEntities.toArray(),
        db.categories.toArray(),
      ]);

    const accountMap = new Map(accounts.map((a) => [a.id, a]));
    const personMap = new Map(people.map((p) => [p.id, p]));
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const unifiedList = [];

    // 1. Process Transactions
    transactions.forEach((tx) => {
      const isTransfer = Boolean(
        tx.isTransferTransaction || tx.type === "transfer",
      );
      const isDebt = Boolean(tx.isDebtTransaction || tx.debtId);

      let recordType = "transaction";
      if (isTransfer) recordType = "transfer";
      if (isDebt) recordType = "debt_tx";

      const acc = accountMap.get(tx.accountId);
      const destAcc = accountMap.get(tx.destinationAccountId);
      const cat = categoryMap.get(tx.categoryId);
      const person = personMap.get(tx.personEntityId);

      unifiedList.push({
        id: `audit_tx_${tx.id}`,
        recordId: String(tx.id || ""),
        debtId: tx.debtId || null,
        entityType: recordType,
        action: tx.isDeleted ? "DELETED" : "RECORDED",
        type: tx.type || "",
        date: tx.date || "",
        createdAt: tx.createdAt || tx.date || "",
        updatedAt: tx.updatedAt || tx.createdAt || "",
        amount: Number(tx.amount || 0),
        totalImpact: Number(tx.totalImpact || tx.amount || 0),
        currency: tx.currency || "USD",
        accountId: tx.accountId || "",
        accountName: acc ? acc.name : "Unknown",
        destinationAccountId: tx.destinationAccountId || "",
        destinationAccountName: destAcc ? destAcc.name : "",
        personEntityId: tx.personEntityId || "",
        personName: person ? person.name : "",
        categoryId: tx.categoryId || "",
        categoryName: cat ? cat.name : "",
        description: tx.description || "",
        isDeleted: Boolean(tx.isDeleted),
        rawRecord: tx,
      });
    });

    // 2. Process Debts
    debts.forEach((debt) => {
      const person = personMap.get(debt.personEntityId);
      const acc = accountMap.get(debt.accountId);

      unifiedList.push({
        id: `audit_debt_${debt.id}`,
        recordId: String(debt.id || ""),
        debtId: debt.id,
        entityType: "debt",
        action: debt.isDeleted ? "DELETED" : "RECORDED",
        type: debt.direction === "i_owe" ? "debt_i_owe" : "debt_they_owe",
        date: debt.startDate || "",
        createdAt: debt.createdAt || debt.startDate || "",
        updatedAt: debt.updatedAt || debt.createdAt || "",
        amount: Number(debt.originalAmount || 0),
        totalImpact: Number(debt.originalAmount || 0),
        currency: debt.currency || "USD",
        accountId: debt.accountId || "",
        accountName: acc ? acc.name : "None",
        personEntityId: debt.personEntityId || "",
        personName: person ? person.name : "Unknown Entity",
        description:
          debt.notes ||
          `${debt.direction === "i_owe" ? "Owe" : "Owed"} ${debt.originalAmount} ${debt.currency}`,
        isDeleted: Boolean(debt.isDeleted),
        status: debt.status,
        rawRecord: debt,
      });
    });

    // 3. Process Debt Payments
    debtPayments.forEach((dp) => {
      const acc = accountMap.get(dp.accountId);

      unifiedList.push({
        id: `audit_dp_${dp.id}`,
        recordId: String(dp.id || ""),
        debtId: dp.debtId,
        entityType: "debt_payment",
        action: dp.isDeleted ? "DELETED" : "RECORDED",
        type: "debt_payment",
        date: dp.date || "",
        createdAt: dp.createdAt || dp.date || "",
        updatedAt: dp.createdAt || "",
        amount: Number(dp.amount || 0),
        totalImpact: Number(dp.accountAmount || dp.amount || 0),
        currency: dp.currency || "USD",
        accountId: dp.accountId || "",
        accountName: acc ? acc.name : "Unknown",
        description: dp.notes || "Debt payment recorded",
        isDeleted: Boolean(dp.isDeleted),
        rawRecord: dp,
      });
    });

    let filtered = unifiedList;

    // Filter by Search Text
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          (item.recordId || "").toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query) ||
          (item.accountName || "").toLowerCase().includes(query) ||
          (item.personName || "").toLowerCase().includes(query) ||
          (item.categoryName || "").toLowerCase().includes(query),
      );
    }

    // Filter by Entity Type
    if (filters.entityType) {
      filtered = filtered.filter(
        (item) => item.entityType === filters.entityType,
      );
    }

    // Filter by Deletion Status
    if (filters.deletionStatus === "deleted") {
      filtered = filtered.filter((item) => item.isDeleted);
    } else if (filters.deletionStatus === "active") {
      filtered = filtered.filter((item) => !item.isDeleted);
    }

    // Filter by Account
    if (filters.accountId) {
      filtered = filtered.filter(
        (item) =>
          item.accountId === filters.accountId ||
          item.destinationAccountId === filters.accountId,
      );
    }

    // Filter by Person / Entity
    if (filters.personEntityId) {
      filtered = filtered.filter(
        (item) => item.personEntityId === filters.personEntityId,
      );
    }

    // Filter strictly by Created-At Date Range
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((item) => {
        const createdDateStr = item.createdAt
          ? item.createdAt.split("T")[0]
          : "";
        if (!createdDateStr) return false;

        if (filters.startDate && createdDateStr < filters.startDate)
          return false;
        if (filters.endDate && createdDateStr > filters.endDate) return false;
        return true;
      });
    }

    // Filter by Amount Min / Max
    if (filters.minAmount !== undefined && filters.minAmount !== "") {
      const min = Number(filters.minAmount);
      filtered = filtered.filter((item) => Number(item.amount) >= min);
    }
    if (filters.maxAmount !== undefined && filters.maxAmount !== "") {
      const max = Number(filters.maxAmount);
      filtered = filtered.filter((item) => Number(item.amount) <= max);
    }

    // Sorting
    const sortField = filters.sortByField || "createdAt";
    const sortDir = filters.sortByDirection || "desc";

    filtered.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      if (sortField === "amount") {
        valA = Number(a.amount || 0);
        valB = Number(b.amount || 0);
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  },
};

export default auditService;
