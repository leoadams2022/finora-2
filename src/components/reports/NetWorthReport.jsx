// src/components/reports/NetWorthReport.jsx

import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import MoneyDisplay from "../ui/MoneyDisplay";

export const NetWorthReport = ({ summary, displayCurrency }) => {
  const {
    totalAssetsBase = 0,
    totalLiabilitiesBase = 0,
    netWorthBase = 0,
    netWorthTrendChart = [],
    debtExposureChart = [],
  } = summary || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Assets
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalAssetsBase}
              currency={displayCurrency}
              className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Liabilities
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={totalLiabilitiesBase}
              currency={displayCurrency}
              className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400 truncate"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Net Worth
          </span>
          <div className="mt-1">
            <MoneyDisplay
              amount={netWorthBase}
              currency={displayCurrency}
              className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate"
            />
          </div>
        </div>
      </div>

      {/* Historical Net Worth Trend */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Historical Net Worth Growth
        </h3>
        {netWorthTrendChart.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No historical snapshots captured yet. Take snapshots in the Net
            Worth page to track history.
          </p>
        ) : (
          <div className="h-60 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={netWorthTrendChart}
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
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Line
                  type="monotone"
                  dataKey="NetWorth"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="Assets"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="Liabilities"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Debt & Counterparty Exposure */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          Debt Exposure by Counterparty
        </h3>
        {debtExposureChart.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            No active debts or counterparty liabilities recorded.
          </p>
        ) : (
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={debtExposureChart}
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
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
                <Bar
                  dataKey="iOwe"
                  name="Money I Owe"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="theyOwe"
                  name="Owed To Me"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetWorthReport;
