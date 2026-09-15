// src/pages/AuditHistory.jsx

import React, { useState } from "react";
import {
  History,
  Eye,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  Filter,
  LayoutList,
  Maximize2,
} from "lucide-react";
import { useAuditHistory } from "../hooks/useAuditHistory";
import { useAccounts } from "../hooks/useAccounts";
import { usePeopleEntities } from "../hooks/usePeopleEntities";
import { useCategories } from "../hooks/useCategories";
import { useCurrencies } from "../hooks/useCurrencies";
import AuditFilters from "../components/audit/AuditFilters";
import MoneyDisplay from "../components/ui/MoneyDisplay";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import TransactionCard from "../components/transactions/TransactionCard";
import TransferCard from "../components/transfers/TransferCard";
import DebtCard from "../components/debts/DebtCard";
import TransactionDetailsModal from "../components/transactions/TransactionDetailsModal";
import TransferDetailsModal from "../components/transfers/TransferDetailsModal";
import DebtDetailsModal from "../components/debts/DebtDetailsModal";
import { getPresetDateRange } from "../utils/dates";
import { useLocalStorage } from "../hooks/useLocalStorage";
import db from "../db/database";

const AuditHistory = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isCompactView, setIsCompactView] = useLocalStorage(
    "audit_isCompactView",
    false,
  );

  const [datePreset, setDatePreset] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    entityType: "",
    deletionStatus: "all",
    accountId: "",
    personEntityId: "",
    startDate: "",
    endDate: "",
    sortByField: "createdAt",
    sortByDirection: "desc",
  });

  // Modal View States
  const [selectedTx, setSelectedTx] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const { records, isLoading } = useAuditHistory(filters);
  const { accounts } = useAccounts();
  const { peopleEntities } = usePeopleEntities();
  const { categories, subcategories } = useCategories();
  const { getCurrency } = useCurrencies();

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDatePresetChange = (presetKey) => {
    setDatePreset(presetKey);
    if (presetKey === "all" || presetKey === "custom") {
      if (presetKey === "all") {
        setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
      }
      return;
    }
    const { startDate, endDate } = getPresetDateRange(presetKey);
    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };

  const handleResetFilters = () => {
    setDatePreset("all");
    setFilters({
      search: "",
      entityType: "",
      deletionStatus: "all",
      accountId: "",
      personEntityId: "",
      startDate: "",
      endDate: "",
      sortByField: "createdAt",
      sortByDirection: "desc",
    });
  };

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortByField: field,
      sortByDirection:
        prev.sortByField === field && prev.sortByDirection === "desc"
          ? "asc"
          : "desc",
    }));
  };

  const handleViewRecord = async (item) => {
    if (item.entityType === "transfer") {
      setSelectedTransfer(item.rawRecord);
    } else if (item.entityType === "debt" || item.entityType === "debt_tx") {
      const fullDebt = await db.debts.get(item.debtId || item.recordId);
      setSelectedDebt(fullDebt || item.rawRecord);
    } else {
      setSelectedTx(item.rawRecord);
    }
  };

  if (isLoading) return <LoadingState message="Loading audit history..." />;

  const activeAccount = selectedTx
    ? accounts.find((a) => a.id === selectedTx.accountId)
    : null;
  const activeCategory = selectedTx
    ? categories.find((c) => c.id === selectedTx.categoryId)
    : null;
  const activeSubcategory = selectedTx
    ? subcategories.find((s) => s.id === selectedTx.subcategoryId)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 sm:space-x-2.5">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span>Audit History & Financial Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Immutable view-only audit trail of all financial records filtered
            strictly by creation timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Toggle Filters Button */}
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              showFilters
                ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span>{showFilters ? "Hide Filters" : "Filters"}</span>
          </button>

          {/* Compact View Switcher Button */}
          <button
            type="button"
            onClick={() => setIsCompactView((prev) => !prev)}
            className={`flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
              isCompactView
                ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
            title="Toggle between standard table and compact card view"
          >
            {isCompactView ? (
              <Maximize2 className="h-4 w-4 shrink-0" />
            ) : (
              <LayoutList className="h-4 w-4 shrink-0" />
            )}
            <span>{isCompactView ? "Full Table" : "Compact View"}</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      {showFilters && (
        <AuditFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          datePreset={datePreset}
          onDatePresetChange={handleDatePresetChange}
          accounts={accounts}
          peopleEntities={peopleEntities}
        />
      )}

      {/* Records Content Area */}
      {records.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit records found"
          description="Try clearing or adjusting your search filters."
        />
      ) : isCompactView ? (
        /* Compact Cards View */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((item) => {
            if (item.entityType === "transfer") {
              const sourceAccount = accounts.find(
                (a) => a.id === item.rawRecord.accountId,
              );
              const destinationAccount = accounts.find(
                (a) => a.id === item.rawRecord.destinationAccountId,
              );
              return (
                <TransferCard
                  key={item.id}
                  transfer={item.rawRecord}
                  sourceAccount={sourceAccount}
                  destinationAccount={destinationAccount}
                  getCurrency={getCurrency}
                  accounts={accounts}
                  onView={() => handleViewRecord(item)}
                  viewOnly={true}
                />
              );
            }

            if (item.entityType === "debt") {
              const person = peopleEntities.find(
                (p) => p.id === item.rawRecord.personEntityId,
              );
              return (
                <DebtCard
                  key={item.id}
                  debt={item.rawRecord}
                  person={person}
                  onView={() => handleViewRecord(item)}
                  viewOnly={true}
                />
              );
            }

            // Standard transactions, debt transactions, and debt payments
            const account = accounts.find(
              (a) => a.id === item.rawRecord.accountId,
            );
            const category = categories.find(
              (c) => c.id === item.rawRecord.categoryId,
            );
            const subcategory = subcategories.find(
              (s) => s.id === item.rawRecord.subcategoryId,
            );

            return (
              <TransactionCard
                key={item.id}
                tx={item.rawRecord}
                account={account}
                category={category}
                subcategory={subcategory}
                getCurrency={getCurrency}
                accounts={accounts}
                onView={() => handleViewRecord(item)}
                viewOnly={true}
              />
            );
          })}
        </div>
      ) : (
        /* Full Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300 min-w-200">
            <thead className="bg-slate-50 text-[10px] sm:text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 select-none">
              <tr>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-3 sm:px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
                >
                  <div className="flex items-center space-x-1">
                    <span>Created At</span>
                    <ArrowUpDown className="h-3 w-3 shrink-0" />
                  </div>
                </th>
                <th className="px-3 sm:px-4 py-3">Status</th>
                <th className="px-3 sm:px-4 py-3">Record Type</th>
                <th className="px-3 sm:px-4 py-3">Description / Context</th>
                <th className="px-3 sm:px-4 py-3">Account / Entity</th>
                <th
                  onClick={() => handleSort("amount")}
                  className="px-3 sm:px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition touch-manipulation"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Amount</span>
                    <ArrowUpDown className="h-3 w-3 shrink-0" />
                  </div>
                </th>
                <th className="px-3 sm:px-4 py-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {records.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition ${
                    item.isDeleted ? "bg-rose-50/30 dark:bg-rose-950/10" : ""
                  }`}
                >
                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap font-mono text-slate-500 text-[11px] sm:text-xs">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : item.date}
                  </td>

                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                    {item.isDeleted ? (
                      <span className="inline-flex items-center space-x-1 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] shrink-0">
                        <Trash2 className="h-3 w-3 shrink-0" />
                        <span>Deleted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] shrink-0">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Active</span>
                      </span>
                    )}
                  </td>

                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap uppercase font-semibold text-slate-700 dark:text-slate-300">
                    {item.entityType?.replace("_", " ")}
                  </td>

                  <td className="px-3 sm:px-4 py-3 max-w-xs truncate font-medium text-slate-900 dark:text-white">
                    {item.description || item.categoryName || item.recordId}
                  </td>

                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-slate-500">
                    {item.accountName}
                    {item.destinationAccountName &&
                      ` → ${item.destinationAccountName}`}
                    {item.personName && ` (${item.personName})`}
                  </td>

                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-right font-bold">
                    <MoneyDisplay
                      amount={item.amount}
                      currency={item.currency}
                    />
                  </td>

                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => handleViewRecord(item)}
                      className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="h-4 w-4 shrink-0" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Read-Only Viewing Modals */}
      <TransactionDetailsModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
        account={activeAccount}
        category={activeCategory}
        subcategory={activeSubcategory}
      />

      <TransferDetailsModal
        isOpen={!!selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
        transfer={selectedTransfer}
      />

      <DebtDetailsModal
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        debt={selectedDebt}
      />
    </div>
  );
};

export default AuditHistory;
