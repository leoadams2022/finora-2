// src/components/reports/CashFlowReport.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import MoneyDisplay from "../ui/MoneyDisplay";
import { ArrowRight, ArrowRightLeft } from "lucide-react";

export const CashFlowReport = ({ summary, displayCurrency }) => {
  const {
    totalIncomeBase = 0,
    totalExpensesBase = 0,
    netCashFlowBase = 0,
    savingsRate = 0,
    cashFlowTrendChart = [],
    totalTransfersVolumeBase = 0,
    transferList = [],
  } = summary || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Income
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalIncomeBase}
              currency={displayCurrency}
              colorize
              className="text-base sm:text-xl font-bold truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Expenses
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={-totalExpensesBase}
              currency={displayCurrency}
              colorize
              className="text-base sm:text-xl font-bold truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Net Cash Flow
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={netCashFlowBase}
              currency={displayCurrency}
              colorize
              className="text-base sm:text-xl font-bold truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Savings Rate
          </span>
          <div className="mt-1 text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Cash Flow Timeline Dual Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Cash Flow Timeline (Income vs. Expenses)
        </h3>
        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cashFlowTrendChart}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(val) => [
                  `${val.toLocaleString()} ${displayCurrency}`,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expenses"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Velocity Trend Line */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Net Cash Flow Velocity Trend
        </h3>
        <div className="h-56 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cashFlowTrendChart}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(val) => [
                  `${val.toLocaleString()} ${displayCurrency}`,
                  "Net Impact",
                ]}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net Flow"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Capital Transfers Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5 sm:pb-3 gap-1.5 sm:gap-2">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="h-4 w-4 text-purple-600 shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Capital Transfers & Internal Movements
            </h3>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Total Moved:{" "}
            <MoneyDisplay
              amount={totalTransfersVolumeBase}
              currency={displayCurrency}
              className="font-bold"
            />
          </span>
        </div>

        {transferList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No inter-account transfers in this period.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
            {transferList.map((tr) => (
              <div
                key={tr.id}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
              >
                <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs flex-wrap min-w-0">
                  <span className="text-slate-400 font-mono shrink-0">
                    {tr.date}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {tr.fromAccount}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {tr.toAccount}
                  </span>
                </div>
                <div className="self-end sm:self-auto shrink-0">
                  <MoneyDisplay
                    amount={tr.amount}
                    currency={tr.currency}
                    className="font-semibold"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowReport;
