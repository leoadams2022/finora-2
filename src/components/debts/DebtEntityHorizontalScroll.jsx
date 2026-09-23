// src/components/debts/DebtEntityHorizontalScroll.jsx

import React from "react";
import { DebtEntityGroupCard } from "./DebtEntityGroupView";

export const DebtEntityHorizontalScroll = ({
  debts = [],
  peopleEntities = [],
  onPay,
  onView,
  onEdit,
  onDelete,
}) => {
  // Group active debts by personEntityId
  const groupedData = debts.reduce((acc, debt) => {
    const entityId = debt.personEntityId || "unknown";
    if (!acc[entityId]) acc[entityId] = [];
    acc[entityId].push(debt);
    return acc;
  }, {});

  const groups = Object.entries(groupedData);

  if (groups.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic p-2">
        No active debts found.
      </p>
    );
  }

  return (
    <div
      style={{ touchAction: "pan-x pan-y" }}
      className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 touch-pan-x overscroll-x-contain scrollbar-thin"
    >
      {groups.map(([entityId, entityDebts]) => {
        const person = peopleEntities.find((p) => p.id === entityId);

        return (
          <div
            key={entityId}
            style={{ touchAction: "pan-x pan-y" }}
            className="min-w-75 sm:min-w-85 max-w-md shrink-0"
          >
            <DebtEntityGroupCard
              entityId={entityId}
              entityDebts={entityDebts}
              person={person}
              onPay={onPay}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              accordionMaxHeight="max-h-80" // Vertical scroll inside accordion
            />
          </div>
        );
      })}
    </div>
  );
};

export default DebtEntityHorizontalScroll;
