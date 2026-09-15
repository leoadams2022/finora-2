// src/components/transfers/TransferForm.jsx
import React, { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../db/database";
import { ArrowRight, X } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import AttachmentUploader from "../common/AttachmentUploader";
import { useAccounts } from "../../hooks/useAccounts";
import { useCurrencies } from "../../hooks/useCurrencies";
import Select from "../ui/Select";
import { getTriangulatedExchangeRate } from "../../finance/conversions";

const DEFAULT_FORM = {
  sourceAccountId: "",
  destinationAccountId: "",
  sourceAmount: "",
  exchangeRate: "1.0",
  destinationAmount: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  hasFee: false,
  feeType: "fixed",
  feeAmount: "",
  feeRate: "",
};

export const TransferForm = ({ onSave, onClose, transferToEdit = null }) => {
  const { accounts } = useAccounts();

  const [formData, setFormData] = useState(() => {
    if (transferToEdit) {
      return {
        sourceAccountId: transferToEdit.accountId || "",
        destinationAccountId: transferToEdit.destinationAccountId || "",
        sourceAmount: transferToEdit.amount
          ? String(transferToEdit.amount)
          : "",
        exchangeRate: transferToEdit.exchangeRate
          ? String(transferToEdit.exchangeRate)
          : "1.0",
        destinationAmount: transferToEdit.destinationAmount
          ? String(transferToEdit.destinationAmount)
          : transferToEdit.amount
            ? String(transferToEdit.amount)
            : "",
        date: transferToEdit.date || new Date().toISOString().split("T")[0],
        description: transferToEdit.description || "",
        hasFee: Boolean(
          transferToEdit.feeAmount && transferToEdit.feeAmount > 0,
        ),
        feeType: "fixed",
        feeAmount: transferToEdit.feeAmount
          ? String(transferToEdit.feeAmount)
          : "",
        feeRate: "",
      };
    }
    return {
      ...DEFAULT_FORM,
      sourceAccountId: accounts[0]?.id || "",
      destinationAccountId: accounts[1]?.id || "",
    };
  });

  const {
    currencies,
    getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();

  const [newAttachments, setNewAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingAttachments = useLiveQuery(
    async () => {
      if (!transferToEdit?.id) return [];
      return await db.attachments
        .where("transactionId")
        .equals(transferToEdit.id)
        .toArray();
    },
    [transferToEdit?.id],
    [],
  );

  const sourceAcc = accounts.find((a) => a.id === formData.sourceAccountId);
  const destAcc = accounts.find((a) => a.id === formData.destinationAccountId);
  const isCrossCurrency =
    sourceAcc && destAcc && sourceAcc.currency !== destAcc.currency;

  // Calculate default triangulated exchange rate when account selections change
  useEffect(() => {
    if (transferToEdit) return; // Skip automatic rate override during editing

    let isMounted = true;

    const fetchExchangeRate = async () => {
      if (!sourceAcc || !destAcc) return;

      if (sourceAcc.currency === destAcc.currency) {
        setFormData((prev) => {
          // eslint-disable-next-line no-unused-vars
          const numSource = Number(prev.sourceAmount || 0);
          return {
            ...prev,
            exchangeRate: "1.0",
            destinationAmount: prev.sourceAmount,
          };
        });
        return;
      }

      try {
        const rate = await getTriangulatedExchangeRate(
          sourceAcc.currency,
          destAcc.currency,
        );

        if (!isMounted) return;

        const rateStr = rate ? String(Number(rate.toFixed(4))) : "1.0";

        setFormData((prev) => {
          const numSource = Number(prev.sourceAmount || 0);
          const numRate = Number(rateStr);
          return {
            ...prev,
            exchangeRate: rateStr,
            destinationAmount: numSource
              ? (numSource * numRate).toFixed(2)
              : "",
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
  }, [
    formData.sourceAccountId,
    formData.destinationAccountId,
    sourceAcc,
    destAcc,
    transferToEdit,
  ]);

  const handleSourceAmountChange = (val) => {
    setFormData((prev) => {
      const numVal = Number(val || 0);
      const rate = Number(prev.exchangeRate || 1);
      const calculatedDest = isCrossCurrency ? (numVal * rate).toFixed(2) : val;
      return {
        ...prev,
        sourceAmount: val,
        destinationAmount: calculatedDest,
      };
    });
  };

  const handleRateChange = (val) => {
    setFormData((prev) => {
      const numSource = Number(prev.sourceAmount || 0);
      const numRate = Number(val || 1);
      return {
        ...prev,
        exchangeRate: val,
        destinationAmount: (numSource * numRate).toFixed(2),
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
      setError(err.message || "Transfer failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeExistingAttachments = (existingAttachments || []).filter(
    (att) => !attachmentsToDelete.includes(att.id),
  );

  if (currenciesisLoading) return null;

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

      {/* Account Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Select
            label="From Account"
            required
            value={formData.sourceAccountId}
            onChange={(val) =>
              setFormData({ ...formData, sourceAccountId: val })
            }
            searchable
            placeholder="Select Account"
          >
            <Select.Option value="">Select Account</Select.Option>

            {accounts.map((acc) => {
              const symbol = getCurrency(acc.currency)?.symbol || acc.currency;
              return (
                <Select.Option key={acc.id} value={acc.id}>
                  <span className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate">{acc.name}</span>
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
          <Select
            label="To Account"
            required
            value={formData.destinationAccountId}
            onChange={(val) =>
              setFormData({ ...formData, destinationAccountId: val })
            }
            searchable
            placeholder="Select Account"
          >
            <Select.Option value="">Select Account</Select.Option>

            {accounts.map((acc) => {
              const symbol = getCurrency(acc.currency)?.symbol || acc.currency;
              return (
                <Select.Option key={acc.id} value={acc.id}>
                  <span className="flex items-center justify-between w-full">
                    <span className="font-semibold truncate">{acc.name}</span>
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
      </div>

      {/* Source Amount */}
      <CurrencyInput
        label="Amount Sent"
        currency={
          sourceAcc?.currency ||
          currencies.find((cur) => cur.isDefault)?.code ||
          "USD"
        }
        value={formData.sourceAmount}
        onChange={handleSourceAmountChange}
        required
      />

      {/* Cross-Currency Panel */}
      {isCrossCurrency && (
        <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 sm:p-4 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex-wrap gap-1">
            <span>Cross-Currency Transfer</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              1{" "}
              {getCurrency(sourceAcc?.currency)?.symbol || sourceAcc?.currency}{" "}
              = {formData.exchangeRate}{" "}
              {getCurrency(destAcc?.currency)?.symbol || destAcc?.currency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium required-asterisk">
                Exchange Rate
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={formData.exchangeRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white outline-none transition min-h-10.5"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-300 mb-1 font-medium truncate">
                Amount Received (
                {getCurrency(destAcc?.currency)?.symbol || destAcc?.currency})
              </label>
              <input
                type="number"
                readOnly
                value={formData.destinationAmount}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none transition min-h-10.5"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transfer Date */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
          Date
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
        />
      </div>

      {/* Transfer Fee Options */}
      <div className="rounded-xl bg-slate-50 p-3 sm:p-3.5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasTransferFee"
            checked={formData.hasFee}
            onChange={(e) =>
              setFormData({ ...formData, hasFee: e.target.checked })
            }
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
          />
          <label
            htmlFor="hasTransferFee"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
          >
            Include Transfer Fee (Expense)
          </label>
        </div>

        {formData.hasFee && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs text-slate-500 mb-1 font-medium">
                Fee Type
              </label>
              <Select
                value={formData.feeType}
                onChange={(val) => setFormData({ ...formData, feeType: val })}
              >
                <Select.Option value="fixed">Fixed Amount</Select.Option>
                <Select.Option value="percentage">Percentage (%)</Select.Option>
              </Select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1 font-medium truncate">
                {formData.feeType === "percentage"
                  ? "Fee Rate (%)"
                  : `Fee Amount (${getCurrency(sourceAcc?.currency)?.symbol || sourceAcc?.currency || "USD"})`}
              </label>
              <input
                type="number"
                step="0.01"
                value={
                  formData.feeType === "percentage"
                    ? formData.feeRate
                    : formData.feeAmount
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [formData.feeType === "percentage"
                      ? "feeRate"
                      : "feeAmount"]: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none transition min-h-10"
              />
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="e.g. Savings allocation"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
        />
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
                className="flex items-center space-x-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 max-w-full"
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

      {/* Attachments Section */}
      <AttachmentUploader
        files={newAttachments}
        onAddFiles={handleAddNewFiles}
        onRemoveFile={handleRemoveNewFile}
      />

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
            : transferToEdit
              ? "Update Transfer"
              : "Execute Transfer"}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;
