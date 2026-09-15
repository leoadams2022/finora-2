// src/pages/Home.jsx

import React, { useState } from "react";
import {
  Wallet,
  Building2,
  Receipt,
  FolderTree,
  Tag,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { useHome } from "../hooks/useHome";
import { useAccounts } from "../hooks/useAccounts";
import { useCategories } from "../hooks/useCategories";
import { usePeopleEntities } from "../hooks/usePeopleEntities";
import { useCurrencies } from "../hooks/useCurrencies";
import { debtService } from "../services/debtService";
import { transactionService } from "../services/transactionService";
import TransactionCard from "../components/transactions/TransactionCard";
import DebtCard from "../components/debts/DebtCard";
import BudgetCard from "../components/budgets/BudgetCard";
import TransactionDetailsModal from "../components/transactions/TransactionDetailsModal";
import TransactionModal from "../components/transactions/TransactionModal";
import DebtDetailsModal from "../components/debts/DebtDetailsModal";
import DebtPaymentModal from "../components/debts/DebtPaymentModal";
import DebtModal from "../components/debts/DebtModal";
import BudgetModal from "../components/budgets/BudgetModal";
import MoneyDisplay from "../components/ui/MoneyDisplay";
import LoadingState from "../components/ui/LoadingState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import db from "../db/database";

const Home = () => {
  const { homeData, isLoading } = useHome();
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const { peopleEntities } = usePeopleEntities();
  const { getCurrency } = useCurrencies();
  const { showSuccess, showError } = useToast();

  // Modals state
  const [selectedTxForView, setSelectedTxForView] = useState(null);
  const [txToEdit, setTxToEdit] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);

  const [selectedDebtForView, setSelectedDebtForView] = useState(null);
  const [debtForPayment, setDebtForPayment] = useState(null);
  const [debtToEdit, setDebtToEdit] = useState(null);
  const [debtToDelete, setDebtToDelete] = useState(null);

  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  if (isLoading)
    return <LoadingState message="Loading dashboard overview..." />;

  const {
    displayCurrency = "USD",
    generalInsights = {},
    accounts: accountCards = [],
    latestTransactions = [],
    activeDebts = [],
    categoryTagInsights = {},
    budgets = [],
    currencyInsights = {},
  } = homeData || {};

  // Handlers
  const handleSaveTransaction = async (formData, newFiles, deleteFiles) => {
    try {
      if (txToEdit) {
        await transactionService.updateTransaction(
          txToEdit.id,
          formData,
          newFiles,
          deleteFiles,
        );
        showSuccess("Transaction updated.");
      }
      setTxToEdit(null);
    } catch (err) {
      showError(err.message || "Failed to update transaction.");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!txToDelete) return;
    try {
      await transactionService.deleteTransaction(txToDelete.id);
      showSuccess("Transaction deleted.");
      setTxToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete transaction.");
    }
  };

  const handleRecordDebtPayment = async (formData) => {
    try {
      await debtService.recordDebtPayment(formData);
      showSuccess("Debt payment recorded.");
      setDebtForPayment(null);
    } catch (err) {
      showError(err.message || "Failed to record payment.");
    }
  };

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return;
    try {
      await debtService.deleteDebt(debtToDelete.id);
      showSuccess("Debt record deleted.");
      setDebtToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete debt.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 pb-8 sm:pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Financial Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Overview of your financial activity, live account status, and spending
          insights.
        </p>
      </div>

      {/* SECTION 0: GENERAL INSIGHTS CARD */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          General Insights (This Month)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Spent This Month
            </span>
            <MoneyDisplay
              amount={-generalInsights.spentThisMonth}
              currency={displayCurrency}
              colorize
              className="text-base sm:text-lg font-bold"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Income This Month
            </span>
            <MoneyDisplay
              amount={generalInsights.incomeThisMonth}
              currency={displayCurrency}
              colorize
              className="text-base sm:text-lg font-bold"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Total Money Available
            </span>
            <MoneyDisplay
              amount={generalInsights.totalMoneyAvailable}
              currency={displayCurrency}
              className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Total Liability
            </span>
            <MoneyDisplay
              amount={generalInsights.totalLiability}
              currency={displayCurrency}
              className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate">
              Total Money Loaned Out
            </span>
            <MoneyDisplay
              amount={generalInsights.totalMoneyLoanedOut}
              currency={displayCurrency}
              className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: ACCOUNTS (HORIZONTAL SCROLL) */}
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Active Accounts</span>
        </h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 touch-pan-x scrollbar-thin">
          {accountCards.map((acc) => (
            <div
              key={acc.id}
              className="min-w-65 sm:min-w-64 max-w-xs shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-white font-bold text-xs sm:text-sm shrink-0"
                    style={{ backgroundColor: acc.color || "#3b82f6" }}
                  >
                    <Building2 className="h-4 w-4 shrink-0" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-32.5 sm:max-w-36">
                      {acc.name}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 capitalize block truncate">
                      {acc.type.replace("_", " ")}{" "}
                      {acc.accountNumberLast4
                        ? `(•${acc.accountNumberLast4})`
                        : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Live Balance
                </span>
                <MoneyDisplay
                  amount={acc.currentBalance}
                  currency={acc.currency}
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white block"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 block">Expenses (Mo)</span>
                  <MoneyDisplay
                    amount={acc.monthlyExpense}
                    currency={acc.currency}
                    className="font-semibold text-rose-500"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block">Income (Mo)</span>
                  <MoneyDisplay
                    amount={acc.monthlyIncome}
                    currency={acc.currency}
                    className="font-semibold text-emerald-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: LATEST TRANSACTIONS (VERTICAL SCROLL VIEW) */}
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Receipt className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Latest Transactions</span>
        </h2>
        <div className="max-h-[70vh] overflow-y-auto pr-0.5 sm:pr-1 space-y-2 sm:space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-2 sm:p-3">
          {latestTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">
              No transactions recorded yet.
            </p>
          ) : (
            latestTransactions.map((tx) => {
              const account = accounts.find((a) => a.id === tx.accountId);
              const category = categories.find((c) => c.id === tx.categoryId);
              const subcategory = subcategories.find(
                (s) => s.id === tx.subcategoryId,
              );

              return (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  account={account}
                  category={category}
                  subcategory={subcategory}
                  getCurrency={getCurrency}
                  accounts={accounts}
                  onView={() => setSelectedTxForView(tx)}
                  onEdit={() => setTxToEdit(tx)}
                  onDelete={() => setTxToDelete(tx)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: ACTIVE DEBTS (HORIZONTAL SCROLL) */}
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <CreditCard className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Active Debts & Liabilities</span>
        </h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 touch-pan-x scrollbar-thin">
          {activeDebts.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-2">
              No active debts found.
            </p>
          ) : (
            activeDebts.map((debt) => {
              const person = peopleEntities.find(
                (p) => p.id === debt.personEntityId,
              );
              return (
                <div
                  key={debt.id}
                  className="min-w-67.5 sm:min-w-72 max-w-sm shrink-0"
                >
                  <DebtCard
                    debt={debt}
                    person={person}
                    onPay={() => setDebtForPayment(debt)}
                    onView={() => setSelectedDebtForView(debt)}
                    onEdit={() => setDebtToEdit(debt)}
                    onDelete={() => setDebtToDelete(debt)}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 4: CATEGORIES & TAGS INSIGHTS CARD */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          Categories & Tags Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs">
          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center space-x-1 mb-1 text-[11px] sm:text-xs">
              <FolderTree className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Category (Most Expenses)</span>
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
              {categoryTagInsights.categoryMostExpenses?.name || "N/A"}
            </p>
            <MoneyDisplay
              amount={categoryTagInsights.categoryMostExpenses?.amount || 0}
              currency={displayCurrency}
              className="text-xs text-slate-500 font-medium block mt-0.5"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center space-x-1 mb-1 text-[11px] sm:text-xs">
              <Tag className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Tag (Most Expenses)</span>
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
              {categoryTagInsights.tagMostExpenses?.name
                ? `#${categoryTagInsights.tagMostExpenses.name}`
                : "N/A"}
            </p>
            <MoneyDisplay
              amount={categoryTagInsights.tagMostExpenses?.amount || 0}
              currency={displayCurrency}
              className="text-xs text-slate-500 font-medium block mt-0.5"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center space-x-1 mb-1 text-[11px] sm:text-xs">
              <FolderTree className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Category (Most Income)</span>
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
              {categoryTagInsights.categoryMostIncome?.name || "N/A"}
            </p>
            <MoneyDisplay
              amount={categoryTagInsights.categoryMostIncome?.amount || 0}
              currency={displayCurrency}
              className="text-xs text-slate-500 font-medium block mt-0.5"
            />
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center space-x-1 mb-1 text-[11px] sm:text-xs">
              <Tag className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Tag (Most Income)</span>
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
              {categoryTagInsights.tagMostIncome?.name
                ? `#${categoryTagInsights.tagMostIncome.name}`
                : "N/A"}
            </p>
            <MoneyDisplay
              amount={categoryTagInsights.tagMostIncome?.amount || 0}
              currency={displayCurrency}
              className="text-xs text-slate-500 font-medium block mt-0.5"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: BUDGETS (HORIZONTAL SCROLL) */}
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <PiggyBank className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Active Budgets</span>
        </h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 pt-1 touch-pan-x scrollbar-thin">
          {budgets.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-2">
              No active budgets configured.
            </p>
          ) : (
            budgets.map((budget) => {
              const category = categories.find(
                (c) => c.id === budget.categoryId,
              );
              return (
                <div
                  key={budget.id}
                  className="min-w-67.5 sm:min-w-72 max-w-sm shrink-0"
                >
                  <BudgetCard
                    budget={budget}
                    category={category}
                    onEdit={(b) => {
                      setBudgetToEdit(b);
                      setIsBudgetModalOpen(true);
                    }}
                    onDelete={() => {}}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 6: CURRENCY INSIGHTS CARD */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400">
          Currency Insights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs">
          <div className="p-3 sm:p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-slate-400 block mb-0.5 truncate text-[11px] sm:text-xs">
                Most Used Currency in Expenses
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate block">
                {currencyInsights.mostUsedCurrencyExpenses?.name || "USD"}
              </span>
            </div>
            <MoneyDisplay
              amount={currencyInsights.mostUsedCurrencyExpenses?.amount || 0}
              currency={
                currencyInsights.mostUsedCurrencyExpenses?.name || "USD"
              }
              className="text-xs sm:text-sm font-bold text-rose-500 shrink-0"
            />
          </div>

          <div className="p-3 sm:p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-slate-400 block mb-0.5 truncate text-[11px] sm:text-xs">
                Most Used Currency in Income
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate block">
                {currencyInsights.mostUsedCurrencyIncome?.name || "USD"}
              </span>
            </div>
            <MoneyDisplay
              amount={currencyInsights.mostUsedCurrencyIncome?.amount || 0}
              currency={currencyInsights.mostUsedCurrencyIncome?.name || "USD"}
              className="text-xs sm:text-sm font-bold text-emerald-500 shrink-0"
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      {selectedTxForView && (
        <TransactionDetailsModal
          isOpen={!!selectedTxForView}
          onClose={() => setSelectedTxForView(null)}
          transaction={selectedTxForView}
          account={accounts.find((a) => a.id === selectedTxForView.accountId)}
          category={categories.find(
            (c) => c.id === selectedTxForView.categoryId,
          )}
          subcategory={subcategories.find(
            (s) => s.id === selectedTxForView.subcategoryId,
          )}
        />
      )}

      {txToEdit && (
        <TransactionModal
          isOpen={!!txToEdit}
          onClose={() => setTxToEdit(null)}
          onSave={handleSaveTransaction}
          transactionToEdit={txToEdit}
        />
      )}

      {selectedDebtForView && (
        <DebtDetailsModal
          isOpen={!!selectedDebtForView}
          onClose={() => setSelectedDebtForView(null)}
          debt={selectedDebtForView}
        />
      )}

      {debtForPayment && (
        <DebtPaymentModal
          isOpen={!!debtForPayment}
          onClose={() => setDebtForPayment(null)}
          debt={debtForPayment}
          onSave={handleRecordDebtPayment}
        />
      )}

      {debtToEdit && (
        <DebtModal
          isOpen={!!debtToEdit}
          onClose={() => setDebtToEdit(null)}
          onSave={async (formData, newFiles, deleteFiles) => {
            await debtService.updateDebt(
              debtToEdit.id,
              formData,
              newFiles,
              deleteFiles,
            );
            setDebtToEdit(null);
            showSuccess("Debt updated.");
          }}
          debtToEdit={debtToEdit}
        />
      )}

      {isBudgetModalOpen && (
        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={async (formData) => {
            if (budgetToEdit) {
              await db.budgets.update(budgetToEdit.id, formData);
              showSuccess("Budget updated.");
            }
            setIsBudgetModalOpen(false);
          }}
          budgetToEdit={budgetToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction?"
        message="Are you sure you want to delete this transaction?"
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!debtToDelete}
        onClose={() => setDebtToDelete(null)}
        onConfirm={handleDeleteDebt}
        title="Delete Debt?"
        message="Are you sure you want to delete this debt record?"
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default Home;
