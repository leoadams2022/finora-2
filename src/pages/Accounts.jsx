import React, { useState } from "react";
import { Plus, Wallet, Eye, EyeOff } from "lucide-react";
import { useAccounts } from "../hooks/useAccounts";
import { accountService } from "../services/accountService";
import AccountCard from "../components/accounts/AccountCard";
import AccountModal from "../components/accounts/AccountModal";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import { useToast } from "../hooks/useToast";

const Accounts = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);

  const { accounts, isLoading } = useAccounts(showArchived);
  const { showSuccess, showError } = useToast();

  const handleOpenAdd = () => {
    setAccountToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (formData) => {
    try {
      if (accountToEdit) {
        await accountService.updateAccount(accountToEdit.id, formData);
        showSuccess("Account updated successfully.");
      } else {
        await accountService.createAccount(formData);
        showSuccess("Account created successfully.");
      }
    } catch (err) {
      showError(err.message || "Failed to save account.");
      throw err;
    }
  };

  const handleToggleArchive = async (account) => {
    try {
      const isArchiving = account.isActive !== false;
      await accountService.toggleArchiveAccount(account.id, isArchiving);
      showSuccess(
        isArchiving
          ? `Account "${account.name}" archived.`
          : `Account "${account.name}" restored.`,
      );
    } catch (err) {
      showError(err.message || "Action failed.");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading financial accounts..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your bank accounts, credit cards, cash, and e-wallets.
          </p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowArchived((prev) => !prev)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition touch-manipulation min-h-10 sm:min-h-0"
          >
            {showArchived ? (
              <EyeOff className="h-4 w-4 shrink-0" />
            ) : (
              <Eye className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">
              {showArchived ? "Hide Archived" : "Show Archived"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg bg-emerald-600 px-3.5 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:bg-emerald-700 transition touch-manipulation min-h-10 sm:min-h-0 shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">Add Account</span>
          </button>
        </div>
      </div>

      {/* Account Grid / Empty State */}
      {!isLoading && accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts found"
          description={
            showArchived
              ? "No accounts exist in your database."
              : "Add your first financial account to start tracking your money."
          }
          actionLabel="Add Account"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenEdit}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAccount}
        accountToEdit={accountToEdit}
      />
    </div>
  );
};

export default Accounts;
