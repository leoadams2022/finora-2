// src/components/layout/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  ArrowUpDown,
  PieChart,
  Repeat,
  Receipt,
  Users,
  TrendingUp,
  BarChart3,
  Search,
  FolderTree,
  Tag,
  Settings,
  X,
  PlusCircle,
  Coins,
  ListClock,
  LayoutPanelLeft,
  ChevronDown,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: LayoutPanelLeft },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Transfers", href: "/transfers", icon: ArrowUpDown },
  { name: "Debts", href: "/debts", icon: Receipt },
  {
    name: "Settings",
    icon: Settings,
    subMenu: [
      { name: "General Settings", href: "/settings", icon: Settings },
      { name: "Accounts", href: "/accounts", icon: Wallet },
      { name: "Budgets", href: "/budgets", icon: PieChart },
      { name: "Recurring", href: "/recurring-transactions", icon: Repeat },
      { name: "Categories", href: "/categories", icon: FolderTree },
      { name: "Tags", href: "/tags", icon: Tag },
      { name: "People & Entities", href: "/people", icon: Users },
      { name: "Currencies", href: "/currencies", icon: Coins },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    subMenu: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Net Worth", href: "/net-worth", icon: TrendingUp },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Audit History", href: "/audit", icon: ListClock },
    ],
  },
];

const Sidebar = ({ isOpen, onClose, onOpenQuickAction }) => {
  const location = useLocation();

  // Manage open accordion state per parent item
  const [openSubMenus, setOpenSubMenus] = useState({});

  // Automatically expand accordion if any of its child items matches current route
  useEffect(() => {
    const newOpenState = { ...openSubMenus };
    navigation.forEach((item) => {
      if (item.subMenu) {
        const isChildActive = item.subMenu.some(
          (sub) => sub.href === location.pathname,
        );
        if (isChildActive) {
          newOpenState[item.name] = true;
        }
      }
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenSubMenus(newOpenState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleSubMenu = (menuName) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2 ">
            <div className="flex size-12 items-center justify-center bg-slate-950 rounded-full">
              {/* F */}
              <img src="./logo-512x512.png" className="size-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Finora
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Global Action Button */}
        <div className="p-4 shrink-0">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:bg-emerald-700 transition"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* Navigation Links List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            // Render Accordion Dropdown for items with subMenu
            if (item.subMenu) {
              const isAccordionOpen = Boolean(openSubMenus[item.name]);
              const isAnySubActive = item.subMenu.some(
                (sub) => sub.href === location.pathname,
              );

              return (
                <div key={item.name} className="space-y-1">
                  {/* Accordion Trigger Header */}
                  <button
                    type="button"
                    onClick={() => toggleSubMenu(item.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isAnySubActive
                        ? "bg-emerald-50/60 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                        isAccordionOpen ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion Submenu Panel */}
                  {isAccordionOpen && (
                    <div className="pl-4 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 my-1">
                      {item.subMenu.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <NavLink
                            key={sub.href}
                            to={sub.href}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center space-x-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                              }`
                            }
                          >
                            <SubIcon className="h-4 w-4 shrink-0" />
                            <span>{sub.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Standard Single Link
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
