import React from "react";
import { Menu, Plus } from "lucide-react";
import DarkModeToggle from "../ui/DarkModeToggle";
import { useCurrencies } from "../../hooks/useCurrencies";

const Header = ({ onMenuToggle, openQuickAction }) => {
  const { currencies, isLoading } = useCurrencies();
  if (isLoading) return "";
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Mobile Menu Trigger */}
      <div className="flex items-center space-x-3 lg:hidden">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-lg font-bold text-slate-900 dark:text-white">
          Finora
        </span>
      </div>

      {/* Header Title / Context Area */}
      <div className="hidden lg:block">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Personal Finance & Money Management
        </h2>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-3">
        {/* Base Currency Indicator */}
        {currencies.find((cur) => cur.isDefault) && (
          <div className="hidden sm:flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Default Currency:{" "}
            <span className="ml-1 text-emerald-600 dark:text-emerald-400">
              {currencies.find((cur) => cur.isDefault).name} (
              {currencies.find((cur) => cur.isDefault).symbol})
            </span>
          </div>
        )}

        {/* Dark Mode Theme Switcher */}
        <DarkModeToggle />

        {/* Global Floating Action Button (FAB) */}
        <button
          onClick={openQuickAction}
          title="Add Transaction, Transfer, or Debt"
          className="hidden lg:flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-800 transition-all transform hover:scale-105"
        >
          <Plus className="h-7 w-7" />
        </button>

        {/* Quick Notifications Placeholder */}
        {/* <button
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button> */}

        {/* User Profile Stub */}
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          <User className="h-5 w-5" />
        </div> */}
      </div>
    </header>
  );
};

export default Header;
