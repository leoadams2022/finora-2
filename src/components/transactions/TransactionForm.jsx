// src/components/transactions/TransactionForm.jsx

import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import CurrencyInput from "../ui/CurrencyInput";
import AttachmentUploader from "../common/AttachmentUploader";
import TagSelect from "../ui/TagSelect";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { attachmentService } from "../../services/attachmentService";
import { useCurrencies } from "../../hooks/useCurrencies";
import Select from "../ui/Select";

const DEFAULT_FORM = {
  type: "expense",
  amount: "",
  accountId: "",
  categoryId: "",
  subcategoryId: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  tags: [],
  hasFee: false,
  feeType: "fixed",
  feeAmount: "",
  feeRate: "",
  notes: "",
};

export default function TransactionForm({
  transactionToEdit,
  onSave,
  onClose,
}) {
  const { accounts } = useAccounts();
  const { categories, subcategories } = useCategories();
  const { tags: availableTags } = useTags();

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const [formData, setFormData] = useState(() => {
    if (!transactionToEdit) {
      return {
        ...DEFAULT_FORM,
        accountId: accounts[0]?.id || "",
      };
    }
    return {
      type: transactionToEdit.type || "expense",
      amount: transactionToEdit.amount?.toString() || "",
      accountId: transactionToEdit.accountId || accounts[0]?.id || "",
      categoryId: transactionToEdit.categoryId || "",
      subcategoryId: transactionToEdit.subcategoryId || "",
      date: transactionToEdit.date || new Date().toISOString().split("T")[0],
      description: transactionToEdit.description || "",
      tags: transactionToEdit.tags || [],
      hasFee: Boolean(
        transactionToEdit.feeAmount && transactionToEdit.feeAmount > 0,
      ),
      feeType: "fixed",
      feeAmount: transactionToEdit.feeAmount?.toString() || "",
      feeRate: "",
      notes: transactionToEdit.notes || "",
    };
  });

  // Attachments State
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);
  const [attachmentsToDelete, setAttachmentsToDelete] = useState([]);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currencies,
    getCurrency,
    isLoading: currenciesisLoading,
  } = useCurrencies();

  // Load existing attachments on edit mode
  useEffect(() => {
    if (transactionToEdit?.id) {
      attachmentService
        .getAttachmentsByEntity(transactionToEdit.id)
        .then((atts) => {
          setExistingAttachments(atts);
        });
    }
  }, [transactionToEdit?.id]);

  const selectedAccount =
    accounts.find((a) => a.id === formData.accountId) || accounts[0];
  const filteredCategories = categories.filter((c) =>
    formData.type === "income" ? c.type === "income" : c.type === "expense",
  );
  const filteredSubcategories = subcategories.filter(
    (s) => s.categoryId === formData.categoryId,
  );

  const handleAddFiles = (files) => {
    setNewAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingAttachment = (attId) => {
    setExistingAttachments((prev) => prev.filter((att) => att.id !== attId));
    setAttachmentsToDelete((prev) => [...prev, attId]);
  };

  const handleRemoveNewAttachment = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave(formData, newAttachments, attachmentsToDelete);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeExistingAttachments = existingAttachments.filter(
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

      {/* Transaction Type Selector */}
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900 gap-1">
        {["expense", "income", "refund"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                type: t,
                categoryId: "",
                subcategoryId: "",
              })
            }
            className={`flex-1 rounded-lg py-2.5 sm:py-2 px-1 text-xs font-semibold capitalize transition touch-manipulation min-h-10 truncate ${
              formData.type === t
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Account Selection */}
        <div>
          <Select
            label="Account"
            required
            value={formData.accountId}
            onChange={(val) => setFormData({ ...formData, accountId: val })}
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

        {/* Amount Input */}
        <CurrencyInput
          label="Amount"
          currency={
            formData.accountId
              ? selectedAccount?.currency
              : currencies.find((cur) => cur.isDefault)?.code || "USD"
          }
          value={formData.amount}
          onChange={(val) => setFormData({ ...formData, amount: val })}
          required
        />
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Select
            label="Category"
            classNames={{
              label:
                "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
            }}
            required={formData.type === "expense"}
            value={formData.categoryId}
            onChange={(val) =>
              setFormData({
                ...formData,
                categoryId: val,
                subcategoryId: "",
              })
            }
            searchable
            placeholder="Select Category"
          >
            <Select.Option value="">Select Category</Select.Option>
            {filteredCategories.map((c) => (
              <Select.Option key={c.id} value={c.id} color={c.color}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {filteredSubcategories.length !== 0 && (
          <div>
            <Select
              label="Subcategory"
              classNames={{
                label:
                  "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1",
              }}
              disabled={
                !formData.categoryId || filteredSubcategories.length === 0
              }
              value={formData.subcategoryId}
              onChange={(val) =>
                setFormData({ ...formData, subcategoryId: val })
              }
              searchable
              placeholder="None"
            >
              <Select.Option value="">None</Select.Option>
              {filteredSubcategories.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
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
          placeholder="e.g. Grocery shopping at Walmart"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
        />
      </div>

      {/* Accordion Section for Date, Fees & Attachments */}
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
            {/* Filterable Tag Selection Dropdown */}
            <TagSelect
              label="Tags"
              availableTags={availableTags}
              selectedTags={formData.tags}
              onChange={(updatedTags) =>
                setFormData({ ...formData, tags: updatedTags })
              }
              placeholder="Select transaction tags..."
            />
            {/* Transaction Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 required-asterisk">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition min-h-10.5"
              />
            </div>

            {/* Notes */}
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
                placeholder="Add extra details or reminders..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
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

            {/* Attachment Uploader */}
            <AttachmentUploader
              files={newAttachments}
              onAddFiles={handleAddFiles}
              onRemoveFile={(index) => handleRemoveNewAttachment(index)}
            />
          </div>
        )}
      </div>

      {/* Form Controls */}
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
            : transactionToEdit
              ? "Save Changes"
              : "Record Transaction"}
        </button>
      </div>
    </form>
  );
}
