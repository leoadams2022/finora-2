// src/pages/Dashboard.jsx

import React from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useDashboardData } from "../hooks/useDashboardData";
import { useCurrencies } from "../hooks/useCurrencies";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { money } from "../finance/money";
import Select from "../components/ui/Select";

const CHART_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useLocalStorage(
    "finora_dashboard_date_filter",
    "this_month",
  );

  // Reusable localStorage hook for Dashboard View Currency
  const [viewCurrency, setViewCurrency] = useLocalStorage(
    "finora_dashboard_view_currency",
    "",
  );

  const { currencies } = useCurrencies();
  const { data, isLoading } = useDashboardData(
    dateFilter,
    null,
    null,
    viewCurrency || null,
  );

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
        Loading Dashboard analytics...
      </div>
    );
  }

  const {
    displayCurrency,
    totalAssetsBase,
    totalLiabilitiesBase,
    netWorthBase,
    totalIncomeBase,
    totalExpensesBase,
    netCashFlowBase,
    accountSummaries,
    expenseByCategoryChart,
    recentTransactions,
  } = data;

  const cashFlowChartData = [
    { name: "Income", amount: totalIncomeBase },
    { name: "Expenses", amount: totalExpensesBase },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time overview converted for display in{" "}
            <span className="font-bold text-emerald-600">
              {displayCurrency}
            </span>
          </p>
        </div>

        <div className="flex flex-col flex-wrap  gap-2 w-full sm:w-auto">
          {/* View Currency Selector */}
          <div className="flex-1 sm:flex-none flex  items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-h-10 touch-manipulation ">
            <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-xs text-slate-500 font-medium shrink-0">
              View in:
            </span>
            <Select
              value={viewCurrency || displayCurrency}
              onChange={(val) => setViewCurrency(val)}
              placeholder="Select Currency"
              classNames={{
                trigger:
                  "border-none! bg-transparent! min-w-fit h-auto shadow-none focus:ring-0 text-xs font-bold text-slate-800 dark:text-slate-200 p-0",
                wrapper: "min-w-fit inline-block flex-1",
                menu: "min-w-fit",
              }}
            >
              {currencies.map((c) => (
                <Select.Option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Date Range Selector */}
          <div className="flex-1 sm:flex-none flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-h-10 touch-manipulation">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <Select
              value={dateFilter}
              onChange={(val) => setDateFilter(val)}
              placeholder="Select Range"
              classNames={{
                trigger:
                  "border-none! bg-transparent! min-w-fit h-auto shadow-none focus:ring-0 text-xs font-bold text-slate-800 dark:text-slate-200 p-0",
                wrapper: "min-w-fit inline-block flex-1",
                menu: "min-w-fit",
              }}
            >
              <Select.Option value="today">Today</Select.Option>
              <Select.Option value="this_week">This Week</Select.Option>
              <Select.Option value="this_month">This Month</Select.Option>
              <Select.Option value="last_month">Last Month</Select.Option>
              <Select.Option value="this_year">This Year</Select.Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {/* Net Worth */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Net Worth
          </span>
          <div className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono truncate">
            {displayCurrency} {money.format(netWorthBase)}
          </div>
        </div>

        {/* Total Assets */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Assets
          </span>
          <div className="mt-1 text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
            {displayCurrency} {money.format(totalAssetsBase)}
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Liabilities
          </span>
          <div className="mt-1 text-base sm:text-lg font-bold text-rose-500 font-mono truncate">
            {displayCurrency} {money.format(totalLiabilitiesBase)}
          </div>
        </div>

        {/* Income */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Income
          </span>
          <div className="mt-1 text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center truncate">
            <TrendingUp className="h-3.5 w-3.5 mr-1 shrink-0" />
            <span className="truncate">{money.format(totalIncomeBase)}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Expenses
          </span>
          <div className="mt-1 text-base sm:text-lg font-bold text-rose-500 font-mono flex items-center truncate">
            <TrendingDown className="h-3.5 w-3.5 mr-1 shrink-0" />
            <span className="truncate">{money.format(totalExpensesBase)}</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Net Cash Flow
          </span>
          <div
            className={`mt-1 text-base sm:text-lg font-bold font-mono truncate ${
              netCashFlowBase >= 0 ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {displayCurrency} {money.format(netCashFlowBase)}
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cash Flow Comparison */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">Cash Flow (in {displayCurrency})</span>
          </h3>
          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <PieIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Expenses by Category (in {displayCurrency})
            </span>
          </h3>
          <div className="h-60 sm:h-72 w-full">
            {expenseByCategoryChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No expense transactions recorded in selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategoryChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label
                  >
                    {expenseByCategoryChart.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Accounts & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Account Summaries List */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Wallet className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Accounts Overview</span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {accountSummaries.map((acc) => (
              <div
                key={acc.id}
                className="py-2.5 sm:py-3 flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {acc.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 capitalize truncate block">
                    {acc.type} • {acc.currency}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    {acc.currency} {money.format(acc.currentBalance)}
                  </div>
                  {acc.currency !== displayCurrency && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      ≈ {displayCurrency} {money.format(acc.balanceInBase)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <div className="space-y-2 sm:space-y-2.5">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs p-2.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 gap-2"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tx.description || tx.type}
                    </div>
                    <div className="text-[10px] text-slate-400">{tx.date}</div>
                  </div>
                </div>
                <div
                  className={`font-mono font-bold shrink-0 ${
                    tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.currency} {money.format(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
