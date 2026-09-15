// src/components/transactions/TransactionCardGrid.jsx
import React from "react";
import TransactionCard from "./TransactionCard";

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
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {" "}
      {transactions.map((tx) => {
        const account = accounts.find((a) => a.id === tx.accountId);
        const category = categories.find((c) => c.id === tx.categoryId);
        const subcategory = subcategories.find(
          (s) => s.id === tx.subcategoryId,
        );
        const attCount =
          attachmentCounts?.[tx.id] || attachmentCounts?.[tx.debtId] || 0;

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
