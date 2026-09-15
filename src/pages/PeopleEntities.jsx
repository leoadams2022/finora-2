// src/pages/PeopleEntities.jsx

import React, { useState } from "react";
import { Users, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { usePeopleEntities } from "../hooks/usePeopleEntities";
import { peopleService } from "../services/peopleService";
import LoadingState from "../components/ui/LoadingState";
import EmptyState from "../components/ui/EmptyState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Select from "../components/ui/Select";
import { useToast } from "../hooks/useToast";

const PeopleEntities = () => {
  // New Entity Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("Person");

  // Edit Entity State
  const [editingEntity, setEditingEntity] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("Person");

  // Delete Confirmation Modal State
  const [entityToDelete, setEntityToDelete] = useState(null);

  const { peopleEntities, isLoading } = usePeopleEntities();
  const { showSuccess, showError } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await peopleService.create({ name, type });
      setName("");
      setType("Person");
      showSuccess("Person/Entity created successfully.");
    } catch (err) {
      showError(err.message || "Failed to create entity.");
    }
  };

  const handleStartEdit = (pe) => {
    setEditingEntity(pe);
    setEditName(pe.name);
    setEditType(pe.type || "Person");
  };

  const handleCancelEdit = () => {
    setEditingEntity(null);
    setEditName("");
    setEditType("Person");
  };

  const handleSaveEdit = async (id) => {
    try {
      await peopleService.update(id, { name: editName, type: editType });
      showSuccess("Person/Entity updated successfully.");
      handleCancelEdit();
    } catch (err) {
      showError(err.message || "Failed to update entity.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;
    try {
      await peopleService.delete(entityToDelete.id);
      showSuccess(`"${entityToDelete.name}" deleted successfully.`);
      setEntityToDelete(null);
    } catch (err) {
      showError(err.message || "Failed to delete entity.");
    }
  };

  if (isLoading) return <LoadingState message="Loading entities..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          People & Entities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage individuals, companies, and organizations associated with debts
          and transactions.
        </p>
      </div>

      {/* Creation Form */}
      <form
        onSubmit={handleCreate}
        className="flex flex-col sm:flex-row max-w-lg gap-2.5 sm:gap-3 items-stretch sm:items-end"
      >
        <div className="flex-1">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. John Doe, Bank)"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10.5"
          />
        </div>
        <div className="w-full sm:w-36 shrink-0">
          <Select
            required
            value={type}
            onChange={(val) => setType(val)}
            placeholder="Select Type"
          >
            <Select.Option value="Person">Person</Select.Option>
            <Select.Option value="Company">Company</Select.Option>
            <Select.Option value="Bank">Bank</Select.Option>
          </Select>
        </div>
        <button
          type="submit"
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 transition shrink-0 min-h-10.5 touch-manipulation shadow-sm"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Entity</span>
        </button>
      </form>

      {/* Grid List */}
      {peopleEntities.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No people or entities added"
          description="Add contacts or organizations to link with debts and loans."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {peopleEntities.map((pe) => {
            const isEditingThis = editingEntity?.id === pe.id;

            return (
              <div
                key={pe.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 shadow-sm transition hover:shadow-md flex flex-col justify-between space-y-3"
              >
                {isEditingThis ? (
                  /* Inline Edit Mode */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition min-h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Type
                      </label>
                      <Select
                        required
                        value={editType}
                        onChange={(val) => setEditType(val)}
                        placeholder="Select Type"
                      >
                        <Select.Option value="Person">Person</Select.Option>
                        <Select.Option value="Company">Company</Select.Option>
                        <Select.Option value="Bank">Bank</Select.Option>
                      </Select>
                    </div>
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition min-h-9 touch-manipulation"
                      >
                        <X className="h-3.5 w-3.5 shrink-0" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(pe.id)}
                        className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 active:bg-emerald-700 transition min-h-9 touch-manipulation shadow-sm"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Display Mode */
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {pe.name}
                      </h3>
                      <span className="inline-block mt-1 rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {pe.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(pe)}
                        className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        title="Edit Entity"
                        aria-label="Edit Entity"
                      >
                        <Edit2 className="h-4 w-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntityToDelete(pe)}
                        className="rounded-lg p-2 sm:p-1.5 text-slate-400 hover:text-rose-500 active:bg-slate-100 dark:active:bg-slate-700 transition touch-manipulation min-w-9 min-h-9 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        title="Delete Entity"
                        aria-label="Delete Entity"
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!entityToDelete}
        onClose={() => setEntityToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Person/Entity?"
        message={`Are you sure you want to delete "${entityToDelete?.name}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default PeopleEntities;
