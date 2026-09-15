// src/components/debts/DebtCardGrid.jsx
import React from "react";
import DebtCard from "./DebtCard";

/**
 * Grid layout wrapper for compact debt cards.
 */
export const DebtCardGrid = ({
  debts = [],
  peopleEntities = [],
  onPay,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {" "}
      {debts.map((debt) => {
        const person = peopleEntities.find((p) => p.id === debt.personEntityId);
        return (
          <DebtCard
            key={debt.id}
            debt={debt}
            person={person}
            onPay={onPay}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default DebtCardGrid;
