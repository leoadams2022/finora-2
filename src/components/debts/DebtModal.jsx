// src/components/debts/DebtModal.jsx
import React from "react";
import { X } from "lucide-react";
import { DebtForm } from "./DebtForm";

const DebtModal = ({ isOpen, onClose, onSave, debtToEdit = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {debtToEdit ? "Edit Debt Record" : "Record Debt"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 sm:mt-4">
          <DebtForm
            key={debtToEdit?.id || "new-debt"}
            onSave={onSave}
            onClose={onClose}
            debtToEdit={debtToEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default DebtModal;
