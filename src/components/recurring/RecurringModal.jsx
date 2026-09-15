// src/components/recurring/RecurringModal.jsx

import React, { useEffect, useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { recurringService } from "../../services/recurringService";
import { useAccounts } from "../../hooks/useAccounts";
import { useCurrencies } from "../../hooks/useCurrencies";
import { useToast } from "../../hooks/useToast";
import Select from "../ui/Select";

const RecurringModal = ({ isOpen, onClose, ruleToEdit = null }) => {
  const { accounts } = useAccounts();
  const {
    currencies,
    getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();
  const { showSuccess } = useToast();

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: ruleToEdit?.name || "",
    type: ruleToEdit?.type || "expense",
    amount: ruleToEdit?.amount ? ruleToEdit.amount.toString() : "",
    currency: ruleToEdit?.currency || "USD",
    accountId: ruleToEdit?.accountId || accounts[0]?.id || "",
    categoryId: ruleToEdit?.categoryId || "cat_food",
    frequency: ruleToEdit?.frequency || "monthly",
    customIntervalDays: ruleToEdit?.customIntervalDays
      ? ruleToEdit.customIntervalDays.toString()
      : "1",
    startDate: ruleToEdit?.startDate || new Date().toISOString().split("T")[0],
    endDate: ruleToEdit?.endDate || "",
    nextOccurrence:
      ruleToEdit?.nextOccurrence || new Date().toISOString().split("T")[0],
    autoCreate:
      ruleToEdit?.autoCreate !== undefined ? ruleToEdit.autoCreate : true,
    status: ruleToEdit?.status || "active",
    notes: ruleToEdit?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Set the default currency once currencies finish loading from Dexie
  useEffect(() => {
    if (!currenciesisLoading && currencies.length > 0) {
      const defaultCurrencyCode =
        currencies.find((cur) => cur.isDefault)?.code || "USD";

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        currency: defaultCurrencyCode,
      }));
    }
  }, [currenciesisLoading, currencies]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (ruleToEdit) {
        await recurringService.updateRecurringTransaction(
          ruleToEdit.id,
          formData,
        );
        showSuccess(`Recurring rule "${formData.name}" updated.`);
      } else {
        await recurringService.createRecurringTransaction(formData);
        showSuccess(`Recurring rule "${formData.name}" created.`);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save recurring rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[99vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {ruleToEdit ? "Edit Recurring Rule" : "Create Recurring Rule"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-3 sm:mt-4 space-y-3.5 sm:space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
              Rule Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Rent, Internet Subscription"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Select
                label="Type"
                required
                value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                placeholder="Select Type"
              >
                <Select.Option value="expense">Expense</Select.Option>
                <Select.Option value="income">Income</Select.Option>
              </Select>
            </div>

            <div>
              <Select
                label="Frequency"
                required
                value={formData.frequency}
                onChange={(val) => setFormData({ ...formData, frequency: val })}
                placeholder="Select Frequency"
              >
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="monthly">Monthly</Select.Option>
                <Select.Option value="yearly">Yearly</Select.Option>
                <Select.Option value="custom">Custom (Days)</Select.Option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
              />
            </div>

            <div>
              <Select
                label="Currency"
                required
                value={formData.currency}
                onChange={(val) => setFormData({ ...formData, currency: val })}
                // searchable
                placeholder="Select Currency"
              >
                {currencies.map((c) => (
                  <Select.Option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Select
                label="Account"
                required
                value={formData.accountId}
                onChange={(val) => setFormData({ ...formData, accountId: val })}
                // searchable
                placeholder="Select Account"
              >
                <Select.Option value="">Select Account</Select.Option>
                {accounts.map((acc) => {
                  const symbol =
                    getCurrency(acc.currency)?.symbol || acc.currency;
                  return (
                    <Select.Option key={acc.id} value={acc.id}>
                      <span className="flex items-center justify-between w-full">
                        <span className="font-semibold truncate">
                          {acc.name}
                        </span>
                        <span className="text-xs text-slate-500 font-normal ml-2 shrink-0">
                          {acc.accountNumberLast4
                            ? `${acc.accountNumberLast4} `
                            : ""}
                          ({symbol})
                        </span>
                      </span>
                    </Select.Option>
                  );
                })}
              </Select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: e.target.value,
                    nextOccurrence: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="autoCreate"
              checked={formData.autoCreate}
              onChange={(e) =>
                setFormData({ ...formData, autoCreate: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label
              htmlFor="autoCreate"
              className="text-xs text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none"
            >
              Auto-Create Transaction (uncheck for manual confirmation)
            </label>
          </div>

          {/* Additional Settings Accordion */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAccordionOpen((prev) => !prev)}
              className="flex w-full items-center justify-between p-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition touch-manipulation min-h-10.5"
            >
              <span className="font-semibold">Additional Rules & Notes</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isAccordionOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAccordionOpen && (
              <div className="p-3 pt-1 space-y-3 sm:space-y-4 border-t border-slate-200 dark:border-slate-700/80">
                {formData.frequency === "custom" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                      Custom Interval (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.customIntervalDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customIntervalDays: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Date{" "}
                    <span className="text-[11px] text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="e.g. Contract details, customer support numbers"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-10 touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition min-h-10 touch-manipulation shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Save Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringModal;
