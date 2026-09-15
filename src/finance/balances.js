import db from "../db/database";
import { money } from "./money";

/**
 * Calculates the current real-time balance of a specific account based on:
 * Opening Balance + Income/Refunds - Expenses/Fees
 */
export const calculateAccountBalance = async (accountId) => {
  const account = await db.accounts.get(accountId);
  if (!account) return 0;

  const initialOpeningBalance = Number(account.openingBalance || 0);

  // Fetch all active ledger lines for this account
  const lines = await db.transactionLines
    .where("accountId")
    .equals(accountId)
    .filter((line) => line.isDeleted !== true)
    .toArray();

  let netChange = 0;

  for (const line of lines) {
    const amount = Number(line.amount || 0);

    if (line.type === "income" || line.type === "refund") {
      netChange = money.add(netChange, amount);
    } else if (line.type === "expense") {
      netChange = money.subtract(netChange, amount);
    }
  }

  return money.add(initialOpeningBalance, netChange);
};
