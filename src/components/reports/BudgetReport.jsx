// src/components/reports/BudgetReport.jsx

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import MoneyDisplay from "../ui/MoneyDisplay";
import EmptyState from "../ui/EmptyState";
import { PieChart } from "lucide-react";

export const BudgetReport = ({ summary, displayCurrency }) => {
  const {
    totalBudgetedBase = 0,
    totalBudgetSpentBase = 0,
    budgetOverviewChart = [],
    budgetReports = [],
  } = summary || {};

  if (budgetReports.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="No active budgets"
        description="Create spending budgets to start tracking period performance."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Budgeted Capacity
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalBudgetedBase}
              currency={displayCurrency}
              className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Spent
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalBudgetSpentBase}
              currency={displayCurrency}
              colorize
              className="text-lg sm:text-xl font-bold truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Net Remaining
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalBudgetedBase - totalBudgetSpentBase}
              currency={displayCurrency}
              className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 truncate"
            />
          </div>
        </div>
      </div>

      {/* Target vs Actual Grouped Bar Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Budget Target vs. Actual Spent
        </h3>
        <div className="h-60 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={budgetOverviewChart}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
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
              <Bar dataKey="Budgeted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Budget Table / Mobile Cards */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
        {/* Mobile View: Stacked Cards */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
          {budgetReports.map((b) => (
            <div key={b.id} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                  {b.name}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.isOverBudget
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                      : b.percentageUsed > 80
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  {b.percentageUsed}%
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                Period: {b.period}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/40">
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">
                    Available
                  </span>
                  <MoneyDisplay
                    amount={b.availableAmount}
                    currency={b.currency}
                    className="font-medium"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">
                    Spent
                  </span>
                  <MoneyDisplay
                    amount={b.spentAmount}
                    currency={b.currency}
                    className="font-medium text-rose-600"
                  />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">
                    Remaining
                  </span>
                  <MoneyDisplay
                    amount={b.remainingAmount}
                    currency={b.currency}
                    className="font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Budget Name</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Spent</th>
                <th className="px-4 py-3 text-right">Remaining</th>
                <th className="px-4 py-3 text-center">Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {budgetReports.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white truncate">
                    {b.name}
                  </td>
                  <td className="px-4 py-3 capitalize">{b.period}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <MoneyDisplay
                      amount={b.availableAmount}
                      currency={b.currency}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-rose-600">
                    <MoneyDisplay
                      amount={b.spentAmount}
                      currency={b.currency}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <MoneyDisplay
                      amount={b.remainingAmount}
                      currency={b.currency}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        b.isOverBudget
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                          : b.percentageUsed > 80
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}
                    >
                      {b.percentageUsed}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BudgetReport;
