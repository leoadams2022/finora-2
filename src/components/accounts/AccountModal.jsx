import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import { ACCOUNT_TYPE_OPTIONS } from "../../constants/accountTypes";
import { useCurrencies } from "../../hooks/useCurrencies";
import LoadingState from "../ui/LoadingState";
import Select from "../ui/Select";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

const DEFAULT_FORM_DATA = {
  name: "",
  type: "",
  currency: "USD",
  openingBalance: "0",
  accountNumberLast4: "",
  description: "",
  color: "#3b82f6",
  icon: "Wallet",
  creditLimit: "0",
  statementDate: "1",
  paymentDueDate: "15",
};

const AccountForm = ({ accountToEdit, onSave, onClose }) => {
  const {
    currencies,
    // getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();

  const [formData, setFormData] = useState(() => {
    if (accountToEdit) {
      return {
        name: accountToEdit.name || "",
        type: accountToEdit.type || "checking",
        currency: accountToEdit.currency || "USD",
        openingBalance: accountToEdit.openingBalance?.toString() || "0",
        accountNumberLast4: accountToEdit.accountNumberLast4 || "",
        description: accountToEdit.description || "",
        color: accountToEdit.color || "#3b82f6",
        icon: accountToEdit.icon || "Wallet",
        creditLimit: accountToEdit.creditLimit?.toString() || "0",
        statementDate: accountToEdit.statementDate?.toString() || "1",
        paymentDueDate: accountToEdit.paymentDueDate?.toString() || "15",
      };
    }

    return {
      ...DEFAULT_FORM_DATA,
    };
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (currenciesisLoading) return <LoadingState message="Loading form..." />;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 sm:mt-4 space-y-3.5 sm:space-y-4"
    >
      {errors.submit && (
        <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          {errors.submit}
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
          Account Name
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
          placeholder="e.g. Primary Checking"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Select
            label="Account Type"
            required
            value={formData.type}
            onChange={(val) => setFormData({ ...formData, type: val })}
            // searchable
            placeholder="Select Account Type"
          >
            <Select.Option value="">Select Account Type</Select.Option>
            {ACCOUNT_TYPE_OPTIONS.map((t) => {
              return (
                <Select.Option key={t.key} value={t.key}>
                  {t.label}
                </Select.Option>
              );
            })}
          </Select>
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
            {currencies.map((cur) => (
              <Select.Option key={cur.code} value={cur.code}>
                {cur.name} ({cur.symbol})
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <CurrencyInput
          label="Opening Balance"
          currency={formData.currency}
          value={formData.openingBalance}
          onChange={(val) => setFormData({ ...formData, openingBalance: val })}
        />

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Last 4 Digits{" "}
            <span className="text-[11px] text-slate-400 font-normal">
              (Optional)
            </span>
          </label>
          <input
            type="text"
            maxLength={4}
            value={formData.accountNumberLast4}
            onChange={(e) =>
              setFormData({
                ...formData,
                accountNumberLast4: e.target.value.replace(/\D/g, ""),
              })
            }
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
            placeholder="e.g. 4321"
          />
        </div>
      </div>

      {/* Credit Card Specific Fields */}
      {formData.type === "credit_card" && (
        <div className="space-y-3 sm:space-y-4 rounded-xl bg-slate-50 p-3 sm:p-4 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
          <h4 className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Credit Card Settings
          </h4>
          <CurrencyInput
            label="Credit Limit"
            currency={formData.currency}
            value={formData.creditLimit}
            onChange={(val) => setFormData({ ...formData, creditLimit: val })}
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Statement Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.statementDate}
                onChange={(e) =>
                  setFormData({ ...formData, statementDate: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm text-slate-900 dark:text-white outline-none min-h-10"
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Payment Due Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.paymentDueDate}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDueDate: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm text-slate-900 dark:text-white outline-none min-h-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Color Picker */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Badge Color
        </label>
        <div className="flex flex-wrap gap-2.5 sm:gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFormData({ ...formData, color: c })}
              className={`h-9 w-9 sm:h-7 sm:w-7 rounded-full border-2 transition touch-manipulation flex items-center justify-center shrink-0 ${
                formData.color === c
                  ? "border-slate-900 dark:border-white scale-110 shadow-sm"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description / Notes
        </label>
        <textarea
          rows="2"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
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
          className="w-full sm:w-auto rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 active:bg-emerald-700 transition min-h-10 touch-manipulation shadow-sm"
        >
          {isSubmitting
            ? "Saving..."
            : accountToEdit
              ? "Save Changes"
              : "Create Account"}
        </button>
      </div>
    </form>
  );
};

const AccountModal = ({ isOpen, onClose, onSave, accountToEdit = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[99vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {accountToEdit ? "Edit Account" : "Add New Account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <AccountForm
          key={accountToEdit ? accountToEdit.id : "new-account"}
          accountToEdit={accountToEdit}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default AccountModal;
