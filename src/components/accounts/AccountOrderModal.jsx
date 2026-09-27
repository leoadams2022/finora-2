// src/components/accounts/AccountOrderModal.jsx

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, X, Wallet } from "lucide-react";
import { accountService } from "../../services/accountService";
import { useToast } from "../../hooks/useToast";

/**
 * Modal to reorder accounts via a 1D sortable list.
 * Staged changes are saved to Dexie/IndexedDB upon clicking "Save Order".
 */
const AccountOrderModal = ({ isOpen, onClose, accounts = [] }) => {
  const { showSuccess, showError } = useToast();

  const [stagedAccounts, setStagedAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize staged list sorted by current sortOrder
      const sorted = [...accounts].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStagedAccounts(sorted);
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  // Handle local state reordering on drag end
  const handleDragEnd = (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(stagedAccounts);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    setStagedAccounts(reordered);
  };

  // Commit changes to IndexedDB
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const orderedIds = stagedAccounts.map((acc) => acc.id);
      await accountService.reorderAccounts(orderedIds);
      showSuccess("Account order saved successfully.");
      onClose();
    } catch (err) {
      showError(err.message || "Failed to save account order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-emerald-600 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reorder Accounts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5 shrink-0" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
          Drag your financial accounts to change their display order, then click{" "}
          <strong>Save Order</strong>.
        </p>

        {/* Scrollable Reorder Area */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="accounts-modal-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {stagedAccounts.map((account, index) => (
                    <Draggable
                      key={account.id}
                      draggableId={account.id}
                      index={index}
                    >
                      {(draggableProvided, snapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          style={{
                            ...draggableProvided.draggableProps.style,
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-900 transition-shadow ${
                            snapshot.isDragging
                              ? "shadow-lg ring-2 ring-emerald-500 border-transparent z-50 opacity-90"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            {/* Drag Handle */}
                            <div
                              {...draggableProvided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition touch-none"
                            >
                              <GripVertical className="h-4 w-4 shrink-0" />
                            </div>

                            <div
                              className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-white font-bold text-xs"
                              style={{
                                backgroundColor: account.color || "#3b82f6",
                              }}
                            >
                              {account.name.charAt(0)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                {account.name}
                              </h4>
                              <span className="text-[10px] text-slate-400 uppercase font-medium block truncate">
                                {account.type.replace("_", " ")} (
                                {account.currency})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountOrderModal;
