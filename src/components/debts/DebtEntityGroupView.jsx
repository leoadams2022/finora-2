// src/components/debts/DebtEntityGroupView.jsx

import React, { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";
import DebtCard from "./DebtCard";

/**
 * Reusable Group Card Component for a single Person / Entity
 */
export const DebtEntityGroupCard = ({
  // eslint-disable-next-line no-unused-vars
  entityId,
  entityDebts = [],
  person,
  onPay,
  onView,
  onEdit,
  onDelete,
  accordionMaxHeight = "max-h-96", // Configurable vertical scroll height
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate aggregated totals for this person/entity
  const totals = entityDebts.reduce(
    (sum, d) => ({
      original: sum.original + Number(d.originalAmount || 0),
      paid: sum.paid + Number(d.totalPaid || 0),
      remaining: sum.remaining + Number(d.remainingBalance || 0),
    }),
    { original: 0, paid: 0, remaining: 0 },
  );

  const primaryCurrency = entityDebts[0]?.currency || "USD";

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition flex flex-col ${className}`}
    >
      {/* Group Card Header / Accordion Trigger */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-3.5 sm:p-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition flex items-center justify-between gap-3 select-none shrink-0"
      >
        {/* Entity Info */}
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {person?.name || "Unknown Entity"}
            </h3>
            <span className="text-xs text-slate-400 block truncate capitalize">
              {person?.type || "Entity"} • {entityDebts.length}{" "}
              {entityDebts.length === 1 ? "Debt" : "Debts"}
            </span>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
          <div className="text-right text-xs">
            <span className="block text-[10px] text-slate-400 font-medium uppercase truncate">
              Remaining
            </span>
            <MoneyDisplay
              amount={totals.remaining}
              currency={primaryCurrency}
              className="font-bold text-sm sm:text-base text-slate-900 dark:text-white"
            />
          </div>

          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Accordion List Content with Vertical Scroll */}
      {isOpen && (
        <div
          className={`border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-3 sm:p-4 overflow-y-auto ${accordionMaxHeight} space-y-3 scrollbar-thin`}
        >
          {/* Summary Breakdown inside Accordion */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">
                Original
              </span>
              <MoneyDisplay
                amount={totals.original}
                currency={primaryCurrency}
                className="font-semibold text-slate-700 dark:text-slate-200"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">
                Total Paid
              </span>
              <MoneyDisplay
                amount={totals.paid}
                currency={primaryCurrency}
                className="font-semibold text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">
                Remaining
              </span>
              <MoneyDisplay
                amount={totals.remaining}
                currency={primaryCurrency}
                className="font-bold text-rose-600 dark:text-rose-400"
              />
            </div>
          </div>

          {/* List of Debt Cards */}
          <div className="space-y-2.5">
            {entityDebts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                person={person}
                onPay={onPay}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Standard Stacked Group View (used on Debts page)
 */
export const DebtEntityGroupView = ({
  debts = [],
  peopleEntities = [],
  onPay,
  onView,
  onEdit,
  onDelete,
}) => {
  const groupedData = debts.reduce((acc, debt) => {
    const entityId = debt.personEntityId || "unknown";
    if (!acc[entityId]) acc[entityId] = [];
    acc[entityId].push(debt);
    return acc;
  }, {});

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {Object.entries(groupedData).map(([entityId, entityDebts]) => {
        const person = peopleEntities.find((p) => p.id === entityId);
        return (
          <DebtEntityGroupCard
            key={entityId}
            entityId={entityId}
            entityDebts={entityDebts}
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

export default DebtEntityGroupView;
