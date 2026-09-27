/**
 * Dexie Schema Definitions for Finora Web App.
 * Maps all entities required for Stage 1 data modeling.
 *
 * Note: Indexed fields are listed in the string schema definitions.
 * Compound indexes are included for efficient query performance.
 */
// src/db/schema.js

export const SCHEMAS = {
  v1: {
    accounts:
      "id, name, type, currency, currentBalance, isActive, createdAt, sortOrder",
    currencies: "code, symbol, name, isDefault, isBase, sortOrder",
    transactions:
      "id, type, date, accountId, categoryId, subcategoryId, personEntityId, status, isDeleted, createdAt",
    transactionLines:
      "id, transactionId, accountId, categoryId, type, currency, isDeleted",
    categories: "id, name, type, isActive, sortOrder",
    subcategories: "id, categoryId, name, isActive, sortOrder",
    tags: "id, name, sortOrder",
    recurringTransactions:
      "id, name, transactionType, frequency, status, nextOccurrence",
    budgets:
      "id, name, period, categoryId, subcategoryId, tagId, startDate, endDate",
    peopleEntities: "id, name, type, createdAt, sortOrder",
    attachments: "id, transactionId, fileName, createdAt",
    auditLogs: "id, entityType, entityId, timestamp",
    netWorthSnapshots: "id, date",
    debts:
      "id, direction, personEntityId, status, dueDate, accountId, isDeleted",
    debtPayments: "id, debtId, transactionId, accountId, date, isDeleted",
  },
};
