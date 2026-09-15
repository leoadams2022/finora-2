// src/components/debts/DebtForm.jsx
import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../db/database";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import AttachmentUploader from "../common/AttachmentUploader";
import { useAccounts } from "../../hooks/useAccounts";
import { usePeopleEntities } from "../../hooks/usePeopleEntities";
import { useCurrencies } from "../../hooks/useCurrencies";
import LoadingState from "../ui/LoadingState";
import Select from "../ui/Select";
import { getTriangulatedExchangeRate } from "../../finance/conversions";

const DEFAULT_FORM = {
  direction: "i_owe",
  personEntityId: "",
  originalAmount: "",
  currency: "USD",
  startDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  notes: "",
  accountId: "",
  exchangeRate: "1.0",
  accountAmount: "",
};

export const DebtForm = ({ onSave, onClose, debtToEdit = null }) => {
  const { accounts } = useAccounts();
  const { peopleEntities } = usePeopleEntities();
  const {
    currencies,
    getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (debtToEdit) {
      return {
        direction: debtToEdit.direction || "i_owe",
        personEntityId: debtToEdit.personEntityId || "",
        originalAmount: debtToEdit.originalAmount
          ? String(debtToEdit.originalAmount)
          : "",
        currency: debtToEdit.currency || "USD",
        startDate:
          debtToEdit.startDate || new Date().toISOString().split("T")[0],
        dueDate: debtToEdit.dueDate || "",
        notes: debtToEdit.notes || "",
        accountId: debtToEdit.accountId || "",
        exchangeRate: debtToEdit.exchangeRate
          ? String(debtToEdit.exchangeRate)
          : "1.0",
        accountAmount: debtToEdit.accountAmount
          ? String(debtToEdit.accountAmount)
          : "",
      };
    }
    return DEFAULT_FORM;
  });

  // Set default debt currency when currencies load
  useEffect(() => {
    if (!debtToEdit && !currenciesisLoading && currencies.length > 0) {
      const defaultCurrencyCode =
        currencies.find((cur) => cur.isDefault)?.code ||
        accounts[0]?.currency ||
        "USD";

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        currency: defaultCurrencyCode,
      }));
    }
  }, [currenciesisLoading, currencies, accounts, debtToEdit]);

  const selectedAccount = accounts.find((a) => a.id === formData.accountId);
  const isCrossCurrency =
    selectedAccount && selectedAccount.currency !== formData.currency;

  // Calculate triangulated exchange rate when debt currency or linked account changes
  useEffect(() => {
    if (debtToEdit) return; // Skip rate calculation when editing existing record

    let isMounted = true;

    const fetchExchangeRate = async () => {
      if (!selectedAccount) return;

      if (selectedAccount.currency === formData.currency) {
        setFormData((prev) => ({
          ...prev,
          exchangeRate: "1.0",
          accountAmount: prev.originalAmount,
        }));
        return;
      }

      try {
        const rate = await getTriangulatedExchangeRate(
          formData.currency,
          selectedAccount.currency,
        );

        if (!isMounted) return;

        const rateStr = rate ? String(Number(rate.toFixed(4))) : "1.0";

        setFormData((prev) => {
          const numAmount = Number(prev.originalAmount || 0);
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
  }, [formData.currency, formData.accountId, selectedAccount, debtToEdit]);

  const [newAttachments, setNewAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingAttachments = useLiveQuery(
    async () => {
      if (!debtToEdit?.id) return [];
      return await db.attachments
        .where("transactionId")
        .equals(debtToEdit.id)
        .toArray();
    },
    [debtToEdit?.id],
    [],
  );

  const handleAmountChange = (val) => {
    setFormData((prev) => {
      const numVal = Number(val || 0);
      const rate = Number(prev.exchangeRate || 1);
      return {
        ...prev,
        originalAmount: val,
        accountAmount: isCrossCurrency ? (numVal * rate).toFixed(2) : val,
      };
    });
  };

  const handleRateChange = (val) => {
    setFormData((prev) => {
      const numAmount = Number(prev.originalAmount || 0);
      const numRate = Number(val || 1);
      return {
        ...prev,
        exchangeRate: val,
        accountAmount: (numAmount * numRate).toFixed(2),
      };
    });
  };

  const handleAddNewFiles = (files) => {
    setNewAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveNewFile = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (attId) => {
    setAttachmentsToDelete((prev) => [...prev, attId]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData, newAttachments, attachmentsToDelete);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save debt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeExistingAttachments = (existingAttachments || []).filter(
    (att) => !attachmentsToDelete.includes(att.id),
  );

  if (currenciesisLoading) return <LoadingState message="Loading form..." />;

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
      {error && (
        <div className="rounded-lg bg-rose-50 p-2.5 sm:p-3 text-xs sm:text-sm text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
          {error}
        </div>
      )}

      {/* Direction Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 gap-1">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, direction: "i_owe" })}
          className={`flex-1 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold transition touch-manipulation min-h-10 truncate ${
            formData.direction === "i_owe"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Money I Owe (Liability)
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, direction: "they_owe" })}
          className={`flex-1 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold transition touch-manipulation min-h-10 truncate ${
            formData.direction === "they_owe"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Money Owed To Me (Asset)
        </button>
      </div>

      {/* Person/Entity Selector */}
      <div>
        <Select
          label="Person / Entity"
          required
          value={formData.personEntityId}
          onChange={(val) => setFormData({ ...formData, personEntityId: val })}
          searchable
          placeholder="Select Person or Organization"
        >
          <Select.Option value="">Select Person or Organization</Select.Option>
          {peopleEntities.map((p) => (
            <Select.Option key={p.id} value={p.id}>
              {p.name} ({p.type})
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Amount & Debt Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <CurrencyInput
          label="Original Amount"
          currency={formData.currency}
          value={formData.originalAmount}
          onChange={handleAmountChange}
          required
        />

        <div>
          <Select
            label="Debt Currency"
            required
            value={formData.currency}
            onChange={(val) => setFormData({ ...formData, currency: val })}
            searchable
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

      {/* Account Selector */}
      <div>
        <Select
          label="Link to Account"
          value={formData.accountId}
          onChange={(val) => setFormData({ ...formData, accountId: val })}
          searchable
          placeholder="None"
          required
        >
          <Select.Option value="">None</Select.Option>
          {accounts.map((acc) => {
            const symbol = getCurrency(acc.currency)?.symbol || acc.currency;

            return (
              <Select.Option key={acc.id} value={acc.id}>
                <span className="flex items-center justify-between w-full">
                  <span className="font-semibold truncate">{acc.name}</span>
                  <span className="text-xs text-slate-500 font-normal ml-2 shrink-0">
                    {acc.accountNumberLast4 ? `${acc.accountNumberLast4} ` : ""}
                    ({symbol})
                  </span>
                </span>
              </Select.Option>
            );
          })}
        </Select>
      </div>

      {/* Cross-Currency Panel if currencies differ */}
      {isCrossCurrency && (
        <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-3 sm:p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 sm:space-y-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex-wrap gap-y-1">
            <span className="shrink-0">Cross-Currency Conversion</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              1 {getCurrency(formData.currency)?.symbol || formData.currency} ={" "}
              {formData.exchangeRate}{" "}
              {getCurrency(selectedAccount.currency)?.symbol ||
                selectedAccount.currency}
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
                Account Impact (
                {getCurrency(selectedAccount.currency)?.symbol ||
                  selectedAccount.currency}
                )
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

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Notes
        </label>
        <textarea
          rows="2"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g. Cross-currency loan details"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition"
        />
      </div>

      {/* Accordion Section for Dates & Attachments */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="flex w-full items-center justify-between p-3 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition touch-manipulation min-h-10.5"
        >
          <span className="font-semibold">
            Additional Details & Attachments
          </span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isAccordionOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isAccordionOpen && (
          <div className="p-3 pt-1 space-y-3.5 sm:space-y-4 border-t border-slate-200 dark:border-slate-700/80">
            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Due Date{" "}
                  <span className="text-[11px] text-slate-400 font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
                />
              </div>
            </div>

            {/* Existing Attachments Display */}
            {activeExistingAttachments.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Existing Attachments
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeExistingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 max-w-full"
                    >
                      <span className="truncate max-w-37.5 sm:max-w-50">
                        {att.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingAttachment(att.id)}
                        className="text-rose-500 hover:text-rose-700 active:bg-rose-50 dark:active:bg-rose-950/40 p-1 rounded transition touch-manipulation shrink-0"
                        aria-label="Remove attachment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments Field */}
            <AttachmentUploader
              files={newAttachments}
              onAddFiles={handleAddNewFiles}
              onRemoveFile={handleRemoveNewFile}
            />
          </div>
        )}
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
            : debtToEdit
              ? "Update Debt"
              : "Record Debt"}
        </button>
      </div>
    </form>
  );
};

export default DebtForm;
