import db from "../db/database";
import { validateAccount } from "../utils/validation";

/**
 * Service handling Account CRUD operations & state toggles in Dexie.
 */
export const accountService = {
  /**
   * Get all active (or all) accounts.
   */
  async getAllAccounts(includeArchived = false) {
    if (includeArchived) {
      return await db.accounts.toArray();
    }
    return await db.accounts.filter((acc) => acc.isActive !== false).toArray();
  },

  /**
   * Get single account by ID.
   */
  async getAccountById(id) {
    return await db.accounts.get(id);
  },

  /**
   * Helper to check for duplicate account name.
   */
  async checkDuplicateName(name, excludeAccountId = null) {
    const cleanName = name.trim().toLowerCase();
    const existing = await db.accounts
      .filter(
        (acc) =>
          acc.name.trim().toLowerCase() === cleanName &&
          acc.id !== excludeAccountId,
      )
      .first();

    return !!existing;
  },

  /**
   * Create a new account safely with structured schema.
   */
  async createAccount(data) {
    const { isValid, errors } = validateAccount(data);
    if (!isValid) {
      throw new Error(Object.values(errors).join(" "));
    }

    // Check for duplicate account name
    const isDuplicate = await this.checkDuplicateName(data.name);
    if (isDuplicate) {
      throw new Error(`An account named "${data.name.trim()}" already exists.`);
    }

    const now = new Date().toISOString();
    const accountId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newAccount = {
      id: accountId,
      name: data.name.trim(),
      type: data.type,
      currency: data.currency,
      openingBalance: Number(data.openingBalance || 0),
      openingDate: data.openingDate || new Date().toISOString().split("T")[0],
      accountNumberLast4: data.accountNumberLast4
        ? data.accountNumberLast4.trim()
        : "",
      description: data.description ? data.description.trim() : "",
      icon: data.icon || "Wallet",
      color: data.color || "#3b82f6",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      // Credit card specific fields
      ...(data.type === "credit_card" && {
        creditLimit: Number(data.creditLimit || 0),
        statementDate: data.statementDate ? Number(data.statementDate) : 1,
        paymentDueDate: data.paymentDueDate ? Number(data.paymentDueDate) : 15,
        minimumPayment: Number(data.minimumPayment || 0),
        interestRate: Number(data.interestRate || 0),
      }),
    };

    await db.accounts.add(newAccount);
    return newAccount;
  },

  /**
   * Update an existing account safely.
   */
  async updateAccount(id, data) {
    const existing = await db.accounts.get(id);
    if (!existing) {
      throw new Error(`Account with ID ${id} not found.`);
    }

    const targetName = data.name !== undefined ? data.name : existing.name;

    // Check for duplicate account name excluding the current account
    const isDuplicate = await this.checkDuplicateName(targetName, id);
    if (isDuplicate) {
      throw new Error(
        `An account named "${targetName.trim()}" already exists.`,
      );
    }

    const updatedPayload = {
      ...existing,
      ...data,
      name: targetName.trim(),
      accountNumberLast4:
        data.accountNumberLast4 !== undefined
          ? data.accountNumberLast4.trim()
          : existing.accountNumberLast4 || "",
      updatedAt: new Date().toISOString(),
    };

    const { isValid, errors } = validateAccount(updatedPayload);
    if (!isValid) {
      throw new Error(Object.values(errors).join(" "));
    }

    await db.accounts.put(updatedPayload);
    return updatedPayload;
  },

  /**
   * Archive / Unarchive account (Soft disable).
   */
  async toggleArchiveAccount(id, archiveState = true) {
    const existing = await db.accounts.get(id);
    if (!existing) throw new Error("Account not found");

    await db.accounts.update(id, {
      isActive: !archiveState,
      updatedAt: new Date().toISOString(),
    });
  },
};
