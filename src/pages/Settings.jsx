// src/pages/Settings.jsx

import React, { useState } from "react";
import {
  Coins,
  Sliders,
  Tags as TagsIcon,
  FolderTree,
  Landmark,
  Database,
  Users,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import CurrenciesSettings from "../components/settings/CurrenciesSettings";
import Categories from "./Categories";
import Tags from "./Tags";
import PeopleEntities from "./PeopleEntities";
import { seedDatabase } from "../db/seed";
import { initializeDefaultData } from "../db/defaultData";
import db from "../db/database";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../hooks/useToast";

export const Settings = () => {
  // Store expanded accordion section IDs. Defaulting 'currencies' to expanded.
  const [expandedSections, setExpandedSections] = useState(["currencies"]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  const toggleSection = (id) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      showSuccess(
        "Sample accounts, categories, tags, and transactions loaded!",
      );
    } catch (err) {
      showError(err.message || "Failed to seed sample data.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      // Clear all IndexedDB tables in an atomic transaction
      await db.transaction(
        "rw",
        [
          db.accounts,
          db.currencies,
          db.transactions,
          db.transactionLines,
          db.categories,
          db.subcategories,
          db.tags,
          db.recurringTransactions,
          db.budgets,
          db.peopleEntities,
          db.attachments,
          db.auditLogs,
          db.netWorthSnapshots,
          db.debts,
          db.debtPayments,
        ],
        async () => {
          await db.accounts.clear();
          await db.currencies.clear();
          await db.transactions.clear();
          await db.transactionLines.clear();
          await db.categories.clear();
          await db.subcategories.clear();
          await db.tags.clear();
          await db.recurringTransactions.clear();
          await db.budgets.clear();
          await db.peopleEntities.clear();
          await db.attachments.clear();
          await db.auditLogs.clear();
          await db.netWorthSnapshots.clear();
          await db.debts.clear();
          await db.debtPayments.clear();

          // Re-populate default system currencies and base categories
          await initializeDefaultData();
        },
      );

      setIsResetConfirmOpen(false);
      showSuccess("All local data has been reset to clean defaults.");
    } catch (err) {
      showError(err.message || "Failed to reset database.");
    } finally {
      setIsResetting(false);
    }
  };

  const sections = [
    {
      id: "seed_data",
      label: "Seed Sample Data",
      description:
        "Load sample accounts, categories, tags, and transactions for demonstration.",
      icon: Database,
      component: (
        <div>
          <button
            type="button"
            onClick={handleSeedData}
            disabled={isSeeding || isResetting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-lg bg-blue-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-700 disabled:opacity-50 transition touch-manipulation min-h-10"
          >
            {isSeeding ? "Seeding..." : "Seed Sample Data"}
          </button>
        </div>
      ),
    },
    {
      id: "reset_data",
      label: "Reset All Data",
      description:
        "Permanently wipe all recorded accounts, transactions, debts, and budgets.",
      icon: Trash2,
      component: (
        <div className="space-y-3">
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 sm:p-4 border border-rose-200 dark:border-rose-900/50 flex items-start space-x-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p>
              <strong>Warning:</strong> Resetting will permanently delete all
              your local accounts, transactions, history, attachments, and
              settings. Base default currencies and categories will be
              re-initialized.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isResetting || isSeeding}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-lg bg-rose-600 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-rose-600 active:bg-rose-700 disabled:opacity-50 transition touch-manipulation min-h-10"
          >
            <Trash2 className="h-4 w-4 shrink-0" />
            <span>Reset All Data</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Manage system configurations, base currency preferences, exchange
          rates, and data controls.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3 sm:space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div
              key={section.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm overflow-hidden transition-colors"
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-5 text-left hover:bg-slate-50/80 dark:hover:bg-slate-700/40 active:bg-slate-100 dark:active:bg-slate-700/60 transition touch-manipulation min-h-12"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 pr-2">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                      {section.label}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal truncate">
                      {section.description}
                    </p>
                  </div>
                </div>

                <ChevronDown
                  className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isExpanded
                      ? "transform rotate-180 text-emerald-600 dark:text-emerald-400"
                      : ""
                  }`}
                />
              </button>

              {/* Accordion Body Content */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/60 p-3.5 sm:p-5 bg-slate-50/30 dark:bg-slate-900/20">
                  {section.component}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Local Data?"
        message="Are you sure you want to delete all financial data? This will erase all accounts, transactions, debts, attachments, and snapshots. This action cannot be undone."
        confirmText={isResetting ? "Resetting..." : "Yes, Reset Everything"}
        variant="danger"
        isLoading={isResetting}
      />
    </div>
  );
};

export default Settings;
