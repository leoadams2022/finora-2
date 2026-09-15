// src/components/debts/DebtPaymentModal.jsx
import React, { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import MoneyDisplay from "../ui/MoneyDisplay";
import { useAccounts } from "../../hooks/useAccounts";
import Select from "../ui/Select";
import { useCurrencies } from "../../hooks/useCurrencies";
import { getTriangulatedExchangeRate } from "../../finance/conversions";

const DebtPaymentForm = ({ debt, onSave, onClose }) => {
  const { accounts } = useAccounts();
  const [formData, setFormData] = useState({
    debtId: debt.id,
    amount: debt.remainingBalance.toString(), // Payment in Debt Currency
    accountId: accounts[0]?.id || "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    exchangeRate: "1.0",
    accountAmount: debt.remainingBalance.toString(),
  });
  const {
    // currencies,
    getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const isCrossCurrency =
    selectedAccount && selectedAccount.currency !== debt.currency;

  // Calculate default exchange rate when selected account or debt currency changes
  useEffect(() => {
    let isMounted = true;

    const fetchExchangeRate = async () => {
      if (!selectedAccount) return;

      if (selectedAccount.currency === debt.currency) {
        setFormData((prev) => ({
          ...prev,
          exchangeRate: "1.0",
          accountAmount: prev.amount,
        }));
        return;
      }

      try {
        const rate = await getTriangulatedExchangeRate(
          debt.currency,
          selectedAccount.currency,
        );

        if (!isMounted) return;

        const rateStr = rate ? String(Number(rate.toFixed(4))) : "1.0";

        setFormData((prev) => {
          const numAmount = Number(prev.amount || 0);
          const numRate = Number(rateStr);
          return {
            ...prev,
            exchangeRate: rateStr,
            accountAmount: numAmount ? (numAmount * numRate).toFixed(2) : "",
          };
        });
      } catch (err) {
        console.error("Failed to fetch triangulated exchange rate:", err);
      }
    };

    fetchExchangeRate();

    return () => {
      isMounted = false;
    };
  }, [formData.accountId, selectedAccount, debt.currency]);

  const handleAmountChange = (val) => {
    setFormData((prev) => {
      const numVal = Number(val || 0);
      const rate = Number(prev.exchangeRate || 1);
      return {
        ...prev,
        amount: val,
        accountAmount: isCrossCurrency ? (numVal * rate).toFixed(2) : val,
      };
    });
  };

  const handleRateChange = (val) => {
    setFormData((prev) => {
      const numAmount = Number(prev.amount || 0);
      const numRate = Number(val || 1);
      return {
        ...prev,
        exchangeRate: val,
        accountAmount: (numAmount * numRate).toFixed(2),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Payment failed.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (currenciesisLoading) return "";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 sm:mt-4 space-y-3.5 sm:space-y-4"
    >
      {error && (
        <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          {error}
        </div>
      )}

      {/* Debt Balance Summary */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-2.5 sm:p-3 text-xs space-y-1 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span>Remaining Debt Balance:</span>
          <MoneyDisplay
            amount={debt.remainingBalance}
            currency={debt.currency}
            className="font-bold text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Payment Amount in Debt Currency */}
      <CurrencyInput
        label={`Payment Amount (${getCurrency(debt.currency)?.symbol || debt.currency})`}
        currency={debt.currency}
        value={formData.amount}
        onChange={handleAmountChange}
        required
      />

      {/* Payment Account Selector */}
      <div>
        <Select
          label={
            debt.direction === "i_owe"
              ? "Pay From Account"
              : "Receive Into Account"
          }
          required
          value={formData.accountId}
          onChange={(val) => setFormData({ ...formData, accountId: val })}
          searchable
          placeholder="Select Account"
        >
          <Select.Option value="">Select Account</Select.Option>
          {accounts.map((acc) => {
            const symbol = getCurrency(acc.currency)?.symbol || acc.currency;
            return (
              <Select.Option key={acc.id} value={acc.id}>
                <span className="flex items-center justify-between w-full">
                  <span className="font-semibold">{acc.name}</span>
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    {acc.accountNumberLast4 ? `${acc.accountNumberLast4} ` : ""}
                    ({symbol})
                  </span>
                </span>
              </Select.Option>
            );
          })}
        </Select>
      </div>

      {/* Cross-Currency Panel if account currency differs from debt currency */}
      {isCrossCurrency && (
        <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 sm:space-y-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex-wrap gap-y-1">
            <span className="shrink-0">Cross-Currency Payment</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              1 {debt.currency} = {formData.exchangeRate}{" "}
              {selectedAccount.currency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium required-asterisk">
                Exchange Rate
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.exchangeRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm text-slate-900 dark:text-white outline-none min-h-10"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium">
                Account Impact ({selectedAccount.currency})
              </label>
              <input
                type="number"
                readOnly
                value={formData.accountAmount}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-2 text-sm text-slate-700 dark:text-slate-300 outline-none font-semibold min-h-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
          Date
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
        />
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
          {isSubmitting ? "Recording..." : "Record Payment"}
        </button>
      </div>
    </form>
  );
};

const DebtPaymentModal = ({ isOpen, onClose, debt, onSave }) => {
  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            Record Debt Payment
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <DebtPaymentForm
          key={debt.id}
          debt={debt}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default DebtPaymentModal;
