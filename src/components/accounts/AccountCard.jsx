import React from "react";
import {
  PiggyBank,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Receipt,
  Wallet,
  Edit2,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";
import { ACCOUNT_TYPES } from "../../constants/accountTypes";

const iconMap = {
  PiggyBank,
  Landmark,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Receipt,
  Wallet,
};

const AccountCard = ({ account, onEdit, onToggleArchive }) => {
  const typeConfig =
    Object.values(ACCOUNT_TYPES).find((t) => t.key === account.type) ||
    ACCOUNT_TYPES.OTHER;
  const IconComponent = iconMap[account.icon] || Wallet;

  const isLiability = typeConfig.isLiability;
  const currentBalance = account.currentBalance ?? account.openingBalance ?? 0;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-xl border p-3.5 sm:p-5 shadow-sm transition hover:shadow-md space-y-3.5 sm:space-y-4 ${
        account.isActive === false
          ? "bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-800 opacity-75"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div
              className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
              style={{ backgroundColor: account.color || "#3b82f6" }}
            >
              <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate max-w-35 sm:max-w-none">
                  {account.name}
                </h3>
                {account.accountNumberLast4 && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    ••• {account.accountNumberLast4}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate mt-0.5">
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onEdit(account)}
              className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center"
              title="Edit Account"
              aria-label="Edit Account"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleArchive(account)}
              className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation min-w-9 min-h-9 flex items-center justify-center"
              title={
                account.isActive === false
                  ? "Restore Account"
                  : "Archive Account"
              }
              aria-label={
                account.isActive === false
                  ? "Restore Account"
                  : "Archive Account"
              }
            >
              {account.isActive === false ? (
                <ArchiveRestore className="h-4 w-4 text-emerald-500" />
              ) : (
                <Archive className="h-4 w-4 text-amber-500" />
              )}
            </button>
          </div>
        </div>

        {/* Live Ledger Current Balance */}
        <div className="mt-3.5 sm:mt-5 border-t border-slate-100 dark:border-slate-700/60 pt-3 sm:pt-4">
          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            Current Balance
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <MoneyDisplay
              amount={currentBalance}
              currency={account.currency}
              colorize={isLiability}
              className="text-xl sm:text-2xl font-bold tracking-tight truncate"
            />
            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {account.currency}
            </span>
          </div>
        </div>

        {/* Credit Card Metrics */}
        {account.type === "credit_card" && (
          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 rounded-lg bg-slate-50 p-2.5 sm:p-3 dark:bg-slate-900/50 text-[11px] sm:text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Credit Limit:</span>
              <MoneyDisplay
                amount={account.creditLimit}
                currency={account.currency}
              />
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Available Credit:</span>
              <MoneyDisplay
                amount={Math.max(
                  0,
                  (account.creditLimit || 0) - currentBalance,
                )}
                currency={account.currency}
              />
            </div>
          </div>
        )}
      </div>

      {account.description && (
        <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {account.description}
        </p>
      )}
    </div>
  );
};

export default AccountCard;
