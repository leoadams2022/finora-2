// src/components/debts/DebtDetailsModal.jsx
import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import db from "../../db/database";
import {
  X,
  Paperclip,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  ArrowRight,
  FileText,
} from "lucide-react";
import MoneyDisplay from "../ui/MoneyDisplay";
import { useAccounts } from "../../hooks/useAccounts";
import { usePeopleEntities } from "../../hooks/usePeopleEntities";
import AttachmentItem from "../common/AttachmentItem";

const DebtDetailsModal = ({ isOpen, onClose, debt }) => {
  const { accounts } = useAccounts();
  const { peopleEntities } = usePeopleEntities();

  // Fetch payment history for this debt
  const payments = useLiveQuery(
    async () => {
      if (!debt?.id) return [];
      return await db.debtPayments
        .where("debtId")
        .equals(debt.id)
        .filter((p) => p.isDeleted !== true)
        .reverse()
        .toArray();
    },
    [debt?.id],
    [],
  );

  // Fetch attachments linked to this debt
  const attachments = useLiveQuery(
    async () => {
      if (!debt?.id) return [];
      return await db.attachments
        .where("transactionId")
        .equals(debt.id)
        .toArray();
    },
    [debt?.id],
    [],
  );

  if (!isOpen || !debt) return null;

  const person = peopleEntities.find((p) => p.id === debt.personEntityId);
  const linkedAccount = accounts.find((a) => a.id === debt.accountId);
  const isIOwe = debt.direction === "i_owe";
  const progressPercent =
    debt.originalAmount > 0
      ? Math.min(
          100,
          Math.round(((debt.totalPaid || 0) / debt.originalAmount) * 100),
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl rounded-t-2xl sm:rounded-xl bg-white p-4 sm:p-6 shadow-xl dark:bg-slate-800 border-t sm:border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap gap-y-1 min-w-0">
            <span
              className={`rounded px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider shrink-0 ${
                isIOwe
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              }`}
            >
              {isIOwe ? "Money I Owe" : "Money Owed To Me"}
            </span>
            <span className="rounded-full bg-slate-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium capitalize text-slate-600 dark:bg-slate-700 dark:text-slate-300 shrink-0">
              {debt.status?.replace("_", " ")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 dark:active:bg-slate-600 transition touch-manipulation shrink-0 min-w-9 min-h-9 flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-5">
          {/* Main Debt Overview Card */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Person / Entity
                </p>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 mt-0.5 truncate">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {person?.name || "Unknown Entity"}
                  </span>
                  {person?.type && (
                    <span className="text-xs font-normal text-slate-400 shrink-0">
                      ({person.type})
                    </span>
                  )}
                </h4>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 border-slate-200 dark:border-slate-700/60 pt-2 sm:pt-0">
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Remaining Balance
                </p>
                <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                  <MoneyDisplay
                    amount={debt.remainingBalance}
                    currency={debt.currency}
                    colorize={isIOwe}
                  />
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 sm:border-0 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 gap-0.5">
                <span>Repayment Progress ({progressPercent}%)</span>
                <span className="truncate">
                  Paid:{" "}
                  <MoneyDisplay
                    amount={debt.totalPaid || 0}
                    currency={debt.currency}
                  />{" "}
                  of{" "}
                  <MoneyDisplay
                    amount={debt.originalAmount}
                    currency={debt.currency}
                  />
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isIOwe ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 min-w-0">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                <p className="text-[10px] text-slate-400 uppercase font-medium truncate">
                  Start Date
                </p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {debt.startDate}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 min-w-0">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                <p className="text-[10px] text-slate-400 uppercase font-medium truncate">
                  Due Date
                </p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {debt.dueDate || "No Due Date"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 min-w-0">
              <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                <p className="text-[10px] text-slate-400 uppercase font-medium truncate">
                  Linked Account
                </p>
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {linkedAccount
                    ? `${linkedAccount.name} (${linkedAccount.currency})`
                    : "None"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 min-w-0">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <div className="min-w-0 truncate">
                <p className="text-[10px] text-slate-400 uppercase font-medium truncate">
                  Debt ID
                </p>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                  {debt.id}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {debt.notes && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notes
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/60 whitespace-pre-wrap wrap-break-word">
                {debt.notes}
              </p>
            </div>
          )}

          {/* Payment History List */}
          <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Payment History ({payments?.length || 0})</span>
            </p>

            {payments && payments.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {payments.map((p) => {
                  const payAcc = accounts.find((a) => a.id === p.accountId);
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/40 text-xs gap-1"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          <MoneyDisplay
                            amount={p.amount}
                            currency={p.currency}
                          />
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {p.date?.split("T")[0]} • {payAcc?.name || "Account"}
                        </p>
                      </div>
                      {p.accountCurrency !== p.currency && (
                        <div className="sm:text-right text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          <span>
                            Account Impact:{" "}
                            <MoneyDisplay
                              amount={p.accountAmount}
                              currency={p.accountCurrency}
                            />
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No payments recorded yet.
              </p>
            )}
          </div>

          {/* Attachments Section */}
          {attachments && attachments.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                <Paperclip className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Attachments ({attachments.length})</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attachments.map((att) => (
                  <AttachmentItem
                    key={att.id || att.fileName}
                    attachment={att}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-4 sm:pt-5 mt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:bg-slate-300 dark:active:bg-slate-500 transition min-h-10 touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebtDetailsModal;
