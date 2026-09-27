import db from "../db/database";
import { calculateAccountBalance } from "../finance/balances";
import { money } from "../finance/money";

/**
 * Validates Account creation & editing payload.
 */
export const validateAccount = (accountData) => {
  const errors = {};

  if (!accountData.name || !accountData.name.trim()) {
    errors.name = "Account name is required.";
  }

  if (!accountData.type) {
    errors.type = "Account type is required.";
  }

  if (!accountData.currency) {
    errors.currency = "Account currency is required.";
  }

  if (
    accountData.accountNumberLast4 &&
    accountData.accountNumberLast4.trim() !== ""
  ) {
    const cleanDigits = accountData.accountNumberLast4.trim();
    if (!/^\d{4}$/.test(cleanDigits)) {
      errors.accountNumberLast4 =
        "Last 4 digits must contain exactly 4 numbers.";
    }
  }

  if (accountData.type === "credit_card") {
    if (
      accountData.creditLimit === undefined ||
      accountData.creditLimit === null ||
      Number(accountData.creditLimit) < 0
    ) {
      errors.creditLimit = "Credit limit must be a non-negative number.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates whether an account has sufficient balance for an outgoing transaction.
 *
 * @param {Object} params
 * @param {string} params.accountId - Target account ID.
 * @param {number} params.outgoingAmount - Total account impact (amount + fees).
 * @param {string} [params.excludeTransactionId] - Transaction ID to ignore when editing.
 */
export const validateSufficientFunds = async ({
  accountId,
  outgoingAmount,
  excludeTransactionId = null,
}) => {
  const account = await db.accounts.get(accountId);
  if (!account) {
    throw new Error("Selected account does not exist.");
  }

  // Calculate current real-time ledger balance
  let currentBalance = await calculateAccountBalance(accountId);

  // If editing an existing transaction, reverse its previous effect to calculate true available balance
  if (excludeTransactionId) {
    const existingTx = await db.transactions.get(excludeTransactionId);
    if (
      existingTx &&
      !existingTx.isDeleted &&
      existingTx.accountId === accountId
    ) {
      currentBalance = money.add(
        currentBalance,
        Number(existingTx.totalImpact || existingTx.amount || 0),
      );
    }
  }

  // Allow credit cards to spend up to their credit limit
  if (account.type === "credit_card") {
    const creditLimit = Number(account.creditLimit || 0);
    // Credit card current balance is a liability (positive number means debt)
    const availableCredit = money.subtract(creditLimit, currentBalance);

    if (outgoingAmount > availableCredit) {
      throw new Error(
        `Transaction exceeds credit limit. Available credit: ${money.format(availableCredit)} ${account.currency}`,
      );
    }
    return;
  }

  // Asset accounts (Checking, Savings, Cash, E-Wallet) cannot go below zero
  if (outgoingAmount > currentBalance) {
    throw new Error(
      `Insufficient funds in "${account.name}". Available balance: ${money.format(currentBalance)} ${account.currency}`,
    );
  }
};
