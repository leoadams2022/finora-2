import db from "../db/database";
import { money } from "./money";

/**
 * Calculates current remaining balance and payments sum for a given debt ID.
 */
export const calculateDebtBalance = async (debtId) => {
  const debt = await db.debts.get(debtId);
  if (!debt)
    return {
      originalAmount: 0,
      totalPaid: 0,
      remainingBalance: 0,
      status: "paid",
    };

  const originalAmount = Number(debt.originalAmount || 0);

  // Fetch active payments for this debt
  const payments = await db.debtPayments
    .where("debtId")
    .equals(debtId)
    .filter((p) => p.isDeleted !== true)
    .toArray();

  const totalPaid = payments.reduce(
    (sum, p) => money.add(sum, Number(p.amount || 0)),
    0,
  );
  const remainingBalance = Math.max(
    0,
    money.subtract(originalAmount, totalPaid),
  );

  let status = debt.status || "active";
  if (remainingBalance === 0 && originalAmount > 0) {
    status = "paid";
  } else if (totalPaid > 0 && remainingBalance > 0) {
    status = "partially_paid";
  }

  return {
    originalAmount,
    totalPaid,
    remainingBalance,
    status,
  };
};
