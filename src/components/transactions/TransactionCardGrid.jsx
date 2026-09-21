// src/components/transactions/TransactionCardGrid.jsx
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import TransactionCard from "./TransactionCard";
import DebtCard from "../debts/DebtCard";
import db from "../../db/database";
import { usePeopleEntities } from "../../hooks/usePeopleEntities";
import { calculateDebtBalance } from "../../finance/debts";

/**
 * Grid layout wrapper for compact transaction cards.
 */
export const TransactionCardGrid = ({
  transactions = [],
  accounts = [],
  categories = [],
  subcategories = [],
  attachmentCounts = {},
  getCurrency,
  onView,
  onEdit,
  onDelete,
  onPay,
}) => {
  const { peopleEntities = [] } = usePeopleEntities();

  // Extract debt IDs from transactions to fetch debts reactively
  const debtIds = transactions
    .filter((tx) => tx.isDebtTransaction && tx.debtId)
    .map((tx) => tx.debtId);

  // Reactively fetch matching debt records along with stats from Dexie
  const debts =
    useLiveQuery(async () => {
      if (debtIds.length === 0) return [];
      const debtRecords = await db.debts.where("id").anyOf(debtIds).toArray();

      // Resolve async debt balances inside the query scope
      return await Promise.all(
        debtRecords.map(async (d) => {
          const stats = await calculateDebtBalance(d.id);
          return { ...d, ...stats };
        }),
      );
    }, [JSON.stringify(debtIds)]) || [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {transactions.map((tx) => {
        const account = accounts.find((a) => a.id === tx.accountId);
        const category = categories.find((c) => c.id === tx.categoryId);
        const subcategory = subcategories.find(
          (s) => s.id === tx.subcategoryId,
        );
        const attCount =
          attachmentCounts?.[tx.id] || attachmentCounts?.[tx.debtId] || 0;

        if (tx.isDebtTransaction) {
          const fullDebt = debts.find((d) => d.id === tx.debtId);
          if (!fullDebt) return null;

          const person = peopleEntities.find(
            (p) => p.id === fullDebt.personEntityId,
          );

          return (
            <DebtCard
              key={fullDebt.id || tx.id}
              debt={fullDebt}
              person={person}
              onPay={onPay}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              passDebtIdKey={true}
            />
          );
        }

        return (
          <TransactionCard
            key={tx.id}
            tx={tx}
            account={account}
            category={category}
            subcategory={subcategory}
            attachmentCount={attCount}
            getCurrency={getCurrency}
            accounts={accounts}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default TransactionCardGrid;
