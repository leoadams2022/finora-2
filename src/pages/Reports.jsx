// src/pages/Reports.jsx

import React, { useState } from "react";
import {
  BarChart3,
  Receipt,
  TrendingUp,
  ArrowRightLeft,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { useReports } from "../hooks/useReports";
import { useCurrencies } from "../hooks/useCurrencies";
import ReportHeader from "../components/reports/ReportHeader";
import ExpenseReport from "../components/reports/ExpenseReport";
import IncomeReport from "../components/reports/IncomeReport";
import CashFlowReport from "../components/reports/CashFlowReport";
import BudgetReport from "../components/reports/BudgetReport";
import NetWorthReport from "../components/reports/NetWorthReport";
import LoadingState from "../components/ui/LoadingState";

const TABS = [
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "income", label: "Income", icon: TrendingUp },
  { id: "cashflow", label: "Cash Flow", icon: ArrowRightLeft },
  { id: "budgets", label: "Budgets", icon: PieChart },
  { id: "networth", label: "Net Worth & Debts", icon: ShieldCheck },
];

export const Reports = () => {
  const [activeTab, setActiveTab] = useState("expenses");
  const [datePreset, setDatePreset] = useState("this_month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [targetViewCurrency, setTargetViewCurrency] = useState("");

  const { currencies, isLoading: currenciesLoading } = useCurrencies();
  const { reportData, isLoading: reportsLoading } = useReports({
    datePreset,
    customStart,
    customEnd,
    targetViewCurrency: targetViewCurrency || undefined,
  });

  if (reportsLoading || currenciesLoading) {
    return <LoadingState message="Generating financial reports..." />;
  }

  const {
    displayCurrency = "USD",
    expenseSummary,
    incomeSummary,
    cashFlowSummary,
    budgetSummary,
    netWorthSummary,
  } = reportData || {};

  const handleCustomDateChange = (field, value) => {
    if (field === "start") setCustomStart(value);
    if (field === "end") setCustomEnd(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 sm:space-x-2.5">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
          <span>Financial Reports & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Deep-dive analysis into expenses, revenue streams, net liquidity
          velocity, budget targets, and net worth.
        </p>
      </div>

      {/* Global Filter Bar Header */}
      <ReportHeader
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        customStart={customStart}
        customEnd={customEnd}
        onCustomDateChange={handleCustomDateChange}
        targetViewCurrency={targetViewCurrency || displayCurrency}
        onCurrencyChange={setTargetViewCurrency}
        currencies={currencies}
      />

      {/* Report Module Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto touch-pan-x scrollbar-thin">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2.5 sm:py-2 text-xs font-semibold transition shrink-0 min-h-10 touch-manipulation ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel */}
      {activeTab === "expenses" && (
        <ExpenseReport
          summary={expenseSummary}
          displayCurrency={displayCurrency}
        />
      )}
      {activeTab === "income" && (
        <IncomeReport
          summary={incomeSummary}
          displayCurrency={displayCurrency}
        />
      )}
      {activeTab === "cashflow" && (
        <CashFlowReport
          summary={cashFlowSummary}
          displayCurrency={displayCurrency}
        />
      )}
      {activeTab === "budgets" && (
        <BudgetReport
          summary={budgetSummary}
          displayCurrency={displayCurrency}
        />
      )}
      {activeTab === "networth" && (
        <NetWorthReport
          summary={netWorthSummary}
          displayCurrency={displayCurrency}
        />
      )}
    </div>
  );
};

export default Reports;
