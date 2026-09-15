// src/components/settings/CurrenciesSettings.jsx

import React, { useState } from "react";
import { Plus, Coins, Trash2, Edit2, ArrowRightLeft, X } from "lucide-react";
import { useCurrencies } from "../../hooks/useCurrencies";
import { currencyService } from "../../services/currencyService";
import { useToast } from "../../hooks/useToast";
import ConfirmDialog from "../ui/ConfirmDialog";

const CurrenciesSettings = () => {
  const { currencies } = useCurrencies();
  const { showSuccess, showError } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencyToEdit, setCurrencyToEdit] = useState(null);
  const [currencyToDelete, setCurrencyToDelete] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    rateToUSD: "1.0",
    isDefault: false,
    isEditing: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (curr = null) => {
    if (curr) {
      setCurrencyToEdit(curr);
      setFormData({
        code: curr.code,
        name: curr.name,
        symbol: curr.symbol,
        rateToUSD: curr.rateToUSD.toString(),
        isDefault: Boolean(curr.isDefault),
        isEditing: true,
      });
    } else {
      setCurrencyToEdit(null);
      setFormData({
        code: "",
        name: "",
        symbol: "",
        rateToUSD: "1.0",
        isDefault: false,
        isEditing: false,
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await currencyService.saveCurrency(formData);
      showSuccess(`Currency ${formData.code.toUpperCase()} saved.`);
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message || "Failed to save currency.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currencyToDelete) return;
    try {
      await currencyService.deleteCurrency(currencyToDelete.code);
      showSuccess(`Currency ${currencyToDelete.code} deleted.`);
      setCurrencyToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete currency.");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Coins className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>Currencies & Exchange Rates</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Define exchange rates relative to 1 USD. Finora triangulates all
            cross-currency conversions using USD as the base bridge.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-2.5 sm:py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Currency</span>
        </button>
      </div>

      {/* Currency Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {currencies.map((curr) => (
          <div
            key={curr.code}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-sm shrink-0">
                  {curr.symbol || curr.code}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 flex-wrap gap-1">
                    <span className="truncate">{curr.code}</span>
                    {curr.isBase && (
                      <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-semibold shrink-0">
                        Base
                      </span>
                    )}
                    {curr.isDefault && (
                      <span className="rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-semibold shrink-0">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {curr.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <button
                  onClick={() => handleOpenModal(curr)}
                  className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                  title="Edit Currency"
                  aria-label="Edit Currency"
                >
                  <Edit2 className="h-4 w-4 shrink-0" />
                </button>
                {curr.code !== "USD" && !curr.isBase && (
                  <button
                    onClick={() => setCurrencyToDelete(curr)}
                    className="rounded-lg p-2 sm:p-1 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                    title="Delete Currency"
                    aria-label="Delete Currency"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-2.5 text-xs flex items-center justify-between border border-slate-100 dark:border-slate-700/60 gap-2">
              <span className="text-slate-500 flex items-center space-x-1 shrink-0">
                <ArrowRightLeft className="h-3 w-3 shrink-0" />
                <span>Rate to 1 USD:</span>
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white truncate text-right">
                1 USD = {curr.rateToUSD} {curr.code}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                {currencyToEdit
                  ? `Edit Currency (${currencyToEdit.code})`
                  : "Add Currency"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="mt-3 sm:mt-4 space-y-3.5 sm:space-y-4"
            >
              {error && (
                <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                    Currency Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    disabled={!!currencyToEdit}
                    placeholder="e.g. EUR"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase disabled:opacity-50 transition min-h-10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. €"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                  Currency Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Euro"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                  Exchange Rate Relative to 1 USD *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-slate-400 select-none">
                    1 USD =
                  </span>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    disabled={formData.code === "USD"}
                    value={formData.rateToUSD}
                    onChange={(e) =>
                      setFormData({ ...formData, rateToUSD: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-16 pr-12 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 font-mono transition min-h-10"
                  />
                  <span className="absolute right-3 text-xs font-bold text-slate-500 select-none">
                    {formData.code || "CUR"}
                  </span>
                </div>
              </div>

              {/* Set as Default Currency Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isDefaultCurrency"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <label
                  htmlFor="isDefaultCurrency"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                  Set as Default Currency
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto rounded-lg border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-10 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition min-h-10 touch-manipulation shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save Currency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!currencyToDelete}
        onClose={() => setCurrencyToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Currency?"
        message={`Are you sure you want to delete ${currencyToDelete?.code}?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CurrenciesSettings;
