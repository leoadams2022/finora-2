// src/components/budgets/BudgetModal.jsx

import React, { useEffect, useState } from "react";
import { X, Tag, FolderTree } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { useCurrencies } from "../../hooks/useCurrencies";
import Select from "../ui/Select";

const BudgetModal = ({ isOpen, onClose, onSave, budgetToEdit }) => {
  const { currencies, isLoading: currenciesisLoading } = useCurrencies();
  const { categories, subcategories } = useCategories();
  const { tags } = useTags();

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    period: "monthly",
    targetType: "category",
    categoryId: "",
    subcategoryId: "",
    tagId: "",
    rolloverEnabled: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form state whenever budgetToEdit or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: budgetToEdit.name || "",
          amount:
            budgetToEdit.amount !== undefined
              ? budgetToEdit.amount.toString()
              : "",
          currency: budgetToEdit.currency || "USD",
          period: budgetToEdit.period || "monthly",
          targetType: budgetToEdit.tagId ? "tag" : "category",
          categoryId: budgetToEdit.categoryId || "",
          subcategoryId: budgetToEdit.subcategoryId || "",
          tagId: budgetToEdit.tagId || "",
          rolloverEnabled: Boolean(budgetToEdit.rolloverEnabled),
        });
      } else {
        const defaultCurrencyCode =
          currencies.find((cur) => cur.isDefault)?.code || "USD";

        setFormData({
          name: "",
          amount: "",
          currency: defaultCurrencyCode,
          period: "monthly",
          targetType: "category",
          categoryId: "",
          subcategoryId: "",
          tagId: "",
          rolloverEnabled: false,
        });
      }
      setError("");
    }
  }, [isOpen, budgetToEdit, currencies]);

  // Set default currency when creating a new budget and currencies finish loading
  useEffect(() => {
    if (
      !currenciesisLoading &&
      currencies.length > 0 &&
      !budgetToEdit &&
      isOpen
    ) {
      const defaultCurrencyCode =
        currencies.find((cur) => cur.isDefault)?.code || "USD";

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        currency: prev.currency || defaultCurrencyCode,
      }));
    }
  }, [currenciesisLoading, currencies, budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const activeSubcategories = subcategories.filter(
    (s) => s.categoryId === formData.categoryId,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Prepare payload depending on chosen target type
    const payload = {
      name: formData.name,
      amount: formData.amount,
      currency: formData.currency,
      period: formData.period,
      rolloverEnabled: formData.rolloverEnabled,
      categoryId:
        formData.targetType === "category" ? formData.categoryId : null,
      subcategoryId:
        formData.targetType === "category" ? formData.subcategoryId : null,
      tagId: formData.targetType === "tag" ? formData.tagId : null,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save budget.");
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
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {budgetToEdit ? "Edit Budget" : "Create New Budget"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
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

          {/* Budget Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
              Budget Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Dining Out or #Vacation Spending"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <CurrencyInput
              label="Limit Amount"
              currency={formData.currency}
              value={formData.amount}
              onChange={(val) => setFormData({ ...formData, amount: val })}
              required
            />

            <div>
              <Select
                label="Budget Currency"
                required
                value={formData.currency}
                onChange={(val) => setFormData({ ...formData, currency: val })}
                placeholder="Select Currency"
              >
                {currencies.map((cur) => (
                  <Select.Option key={cur.code} value={cur.code}>
                    {cur.name} ({cur.symbol})
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Select
                label="Period"
                required
                value={formData.period}
                onChange={(val) => setFormData({ ...formData, period: val })}
                placeholder="Select Period"
              >
                <Select.Option value="monthly">Monthly</Select.Option>
                <Select.Option value="weekly">Weekly</Select.Option>
                <Select.Option value="daily">Daily</Select.Option>
                <Select.Option value="quarterly">
                  Quarterly (3 Months)
                </Select.Option>
                <Select.Option value="semi_annual">
                  Semi-Annual (6 Months)
                </Select.Option>
                <Select.Option value="yearly">Yearly</Select.Option>
              </Select>
            </div>
          </div>

          {/* Target Scope Switcher */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 required-asterisk">
              Target Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    targetType: "category",
                    tagId: "",
                  })
                }
                className={`flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border p-2.5 text-xs font-medium transition touch-manipulation min-h-10.5 ${
                  formData.targetType === "category"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <FolderTree className="h-4 w-4 shrink-0" />
                <span className="truncate">Category / Subcategory</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    targetType: "tag",
                    categoryId: "",
                    subcategoryId: "",
                  })
                }
                className={`flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border p-2.5 text-xs font-medium transition touch-manipulation min-h-10.5 ${
                  formData.targetType === "tag"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Tag className="h-4 w-4 shrink-0" />
                <span className="truncate">Tag</span>
              </button>
            </div>
          </div>

          {/* Category Target Selectors */}
          {formData.targetType === "category" && (
            <div className="space-y-3">
              <div>
                <Select
                  label="Category"
                  required={formData.targetType === "category"}
                  value={formData.categoryId}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      categoryId: val,
                      subcategoryId: "",
                    })
                  }
                  searchable
                  placeholder="Select Expense Category"
                >
                  <Select.Option value="">
                    Select Expense Category
                  </Select.Option>
                  {categories
                    .filter((c) => c.type === "expense")
                    .map((cat) => (
                      <Select.Option
                        key={cat.id}
                        value={cat.id}
                        color={cat.color}
                      >
                        {cat.name}
                      </Select.Option>
                    ))}
                </Select>
              </div>

              {formData.categoryId && activeSubcategories.length > 0 && (
                <div>
                  <Select
                    label="Subcategory Target"
                    value={formData.subcategoryId}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        subcategoryId: val,
                      })
                    }
                    searchable
                    placeholder="All Subcategories in this Category"
                  >
                    <Select.Option value="">
                      All Subcategories in this Category
                    </Select.Option>
                    {activeSubcategories.map((sub) => (
                      <Select.Option key={sub.id} value={sub.id}>
                        {sub.name}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Tag Target Selector */}
          {formData.targetType === "tag" && (
            <div>
              <Select
                label="Tag"
                required={formData.targetType === "tag"}
                value={formData.tagId}
                onChange={(val) => setFormData({ ...formData, tagId: val })}
                searchable
                placeholder="Select Tag"
              >
                <Select.Option value="">Select Tag</Select.Option>
                {tags.map((t) => (
                  <Select.Option key={t.id} value={t.name}>
                    #{t.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}

          {/* Rollover Checkbox */}
          <div className="flex items-start space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="rolloverToggle"
              checked={formData.rolloverEnabled}
              onChange={(e) =>
                setFormData({ ...formData, rolloverEnabled: e.target.checked })
              }
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 shrink-0"
            />
            <label
              htmlFor="rolloverToggle"
              className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none"
            >
              Enable Budget Rollover (Carry over remaining balance)
            </label>
          </div>

          {/* Actions */}
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
              {isSubmitting
                ? "Saving..."
                : budgetToEdit
                  ? "Update Budget"
                  : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
