// src/pages/NetWorth.jsx

import React, { useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Building2,
  CreditCard,
  Camera,
  Trash2,
  Coins,
  History,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useNetWorth } from "../hooks/useNetWorth";
import { useCurrencies } from "../hooks/useCurrencies";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { netWorthService } from "../services/netWorthService";
import { money } from "../finance/money";
import { useToast } from "../hooks/useToast";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Select from "../components/ui/Select";

const NetWorth = () => {
  const [viewCurrency, setViewCurrency] = useLocalStorage(
    "finora_networth_view_currency",
    "",
  );
  const { currencies } = useCurrencies();
  const { liveSummary, snapshots, isLoading } = useNetWorth(
    viewCurrency || null,
  );
  const { showSuccess, showError } = useToast();

  const [isCapturing, setIsCapturing] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState(null);

  if (isLoading || !liveSummary) {
    return (
      <div className="p-8 text-center text-xs sm:text-sm text-slate-500">
        Loading Net Worth calculations...
      </div>
    );
  }

  const {
    displayCurrency,
    totalAssets,
    totalLiabilities,
    netWorth,
    assetBreakdown,
    liabilityBreakdown,
  } = liveSummary;

  const handleCaptureSnapshot = async () => {
    setIsCapturing(true);
    try {
      await netWorthService.recordSnapshot("Manual snapshot entry");
      showSuccess(`Recorded Net Worth snapshot for today!`);
    } catch (err) {
      showError(err.message || "Failed to record snapshot.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleDeleteSnapshot = async () => {
    if (!snapshotToDelete) return;
    try {
      await netWorthService.deleteSnapshot(snapshotToDelete.id);
      showSuccess(`Deleted snapshot from ${snapshotToDelete.date}`);
      setSnapshotToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete snapshot.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            <span>Net Worth Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Track total wealth (Assets - Liabilities) in{" "}
            <span className="font-bold text-emerald-600">
              {displayCurrency}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* View Currency Switcher */}
          <div className="flex-1 sm:flex-none flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm min-h-10 touch-manipulation">
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

          <button
            type="button"
            onClick={handleCaptureSnapshot}
            disabled={isCapturing}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 sm:px-3 py-2.5 sm:py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition disabled:opacity-50 min-h-10 sm:min-h-0 touch-manipulation shrink-0"
          >
            <Camera className="h-4 w-4 shrink-0" />
            <span>{isCapturing ? "Capturing..." : "Record Snapshot"}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Net Worth */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <span>Net Worth</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono truncate">
            {displayCurrency} {money.format(netWorth)}
          </div>
        </div>

        {/* Total Assets */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <span>Total Assets</span>
            <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
            {displayCurrency} {money.format(totalAssets)}
          </div>
        </div>

        {/* Total Liabilities */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
            <span>Total Liabilities</span>
            <CreditCard className="h-4 w-4 text-rose-500 shrink-0" />
          </div>
          <div className="mt-2 sm:mt-3 text-xl sm:text-2xl font-bold text-rose-500 font-mono truncate">
            {displayCurrency} {money.format(totalLiabilities)}
          </div>
        </div>
      </div>

      {/* Historical Net Worth Trend Chart */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <History className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Historical Net Worth Trend</span>
        </h3>

        <div className="h-60 sm:h-72 w-full">
          {snapshots.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic text-center p-4">
              No historical snapshots captured yet. Click "Record Snapshot"
              above to save your net worth over time.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshots}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Assets & Liabilities Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Assets Breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Assets Breakdown</span>
            <span className="text-emerald-600 text-xs font-mono">
              {assetBreakdown.length} Accounts
            </span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {assetBreakdown.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {item.type}
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-slate-900 dark:text-white shrink-0">
                  {displayCurrency} {money.format(item.balanceInDisplay)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liabilities Breakdown */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Liabilities Breakdown</span>
            <span className="text-rose-500 text-xs font-mono">
              {liabilityBreakdown.length} Items
            </span>
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {liabilityBreakdown.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 italic">
                No active liabilities recorded
              </div>
            ) : (
              liabilityBreakdown.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize truncate">
                      {item.type}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-rose-500 shrink-0">
                    {displayCurrency} {money.format(item.balanceInDisplay)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      {snapshots.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Captured Snapshot Log</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-137.5">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase text-[10px] select-none">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Assets</th>
                  <th className="p-2.5">Liabilities</th>
                  <th className="p-2.5">Net Worth</th>
                  <th className="p-2.5">Notes</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {snapshots.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td className="p-2.5 font-semibold whitespace-nowrap">
                      {s.date}
                    </td>
                    <td className="p-2.5 font-mono text-emerald-600 whitespace-nowrap">
                      {money.format(s.totalAssets)}
                    </td>
                    <td className="p-2.5 font-mono text-rose-500 whitespace-nowrap">
                      {money.format(s.totalLiabilities)}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {money.format(s.netWorth)}
                    </td>
                    <td className="p-2.5 text-slate-400 max-w-xs truncate">
                      {s.notes}
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSnapshotToDelete(s)}
                        className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 inline-flex items-center justify-center"
                        title="Delete Snapshot"
                        aria-label="Delete Snapshot"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={!!snapshotToDelete}
        onClose={() => setSnapshotToDelete(null)}
        onConfirm={handleDeleteSnapshot}
        title="Delete Snapshot?"
        message={`Are you sure you want to delete snapshot entry from ${snapshotToDelete?.date}?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default NetWorth;
