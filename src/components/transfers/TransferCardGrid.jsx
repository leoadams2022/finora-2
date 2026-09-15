// src/components/transfers/TransferCardGrid.jsx
import React from "react";
import TransferCard from "./TransferCard";

/**
 * Responsive Grid layout wrapper for compact transfer cards.
 */
export const TransferCardGrid = ({
  transfers = [],
  accounts = [],
  attachmentCounts = {},
  getCurrency,
  onView,
  onEdit,
  onDelete,
  viewOnly = false,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {transfers.map((trf) => {
        const sourceAccount = accounts.find((a) => a.id === trf.accountId);
        const destinationAccount = accounts.find(
          (a) => a.id === trf.destinationAccountId,
        );
        const attCount = attachmentCounts?.[trf.id] || 0;

        return (
          <TransferCard
            key={trf.id}
            transfer={trf}
            sourceAccount={sourceAccount}
            destinationAccount={destinationAccount}
            attachmentCount={attCount}
            getCurrency={getCurrency}
            accounts={accounts}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            viewOnly={viewOnly}
          />
        );
      })}
    </div>
  );
};

export default TransferCardGrid;
