// src/components/layout/MobileNavbar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutPanelLeft,
  ArrowRightLeft,
  ArrowUpDown,
  Receipt,
  Plus,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: LayoutPanelLeft },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Transfers", href: "/transfers", icon: ArrowUpDown },
  { name: "Debts", href: "/debts", icon: Receipt },
];

export const MobileNavbar = ({ openQuickAction }) => {
  const firstHalf = navItems.slice(0, 2);
  const secondHalf = navItems.slice(2, 4);

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 lg:hidden px-2 pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex h-16 items-center justify-around relative max-w-md mx-auto">
        {/* First 2 Navigation Links */}
        <div className="flex items-center justify-around w-2/5">
          {firstHalf.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center space-y-1 py-1 px-2 text-[10px] font-medium transition touch-manipulation min-w-12 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate max-w-16">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Floating Quick Action Center Button */}
        <div className="relative -top-5 flex items-center justify-center">
          <button
            type="button"
            onClick={openQuickAction}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 active:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/50 touch-manipulation"
            aria-label="Add Transaction"
            title="Add Transaction"
          >
            <Plus className="h-6 w-6 shrink-0" />
          </button>
        </div>

        {/* Second 2 Navigation Links */}
        <div className="flex items-center justify-around w-2/5">
          {secondHalf.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center space-y-1 py-1 px-2 text-[10px] font-medium transition touch-manipulation min-w-12 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate max-w-16">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNavbar;
