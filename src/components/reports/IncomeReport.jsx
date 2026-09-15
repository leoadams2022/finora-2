// src/components/reports/IncomeReport.jsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
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
import { TrendingUp } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b"];

export const IncomeReport = ({ summary, displayCurrency }) => {
  const {
    totalIncomeBase = 0,
    categoryChart = [],
    accountChart = [],
  } = summary || {};

  if (totalIncomeBase === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No income data"
        description="There are no recorded income sources for the selected date range."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Total Inflows & Income
        </span>
        <div className="mt-1 sm:mt-2">
          <MoneyDisplay
            amount={totalIncomeBase}
            currency={displayCurrency}
            colorize
            className="text-2xl sm:text-3xl font-extrabold truncate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income by Source / Category */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Income Distribution by Category
          </h3>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
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
                    "Income",
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Received by Account */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Income Received by Account
          </h3>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accountChart}
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
                    "Received",
                  ]}
                />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeReport;
