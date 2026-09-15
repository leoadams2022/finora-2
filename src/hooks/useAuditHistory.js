// src/hooks/useAuditHistory.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { auditService } from "../services/auditService";

export const useAuditHistory = (filters = {}) => {
  const auditData = useLiveQuery(
    async () => {
      await Promise.all([
        db.transactions.count(),
        db.debts.count(),
        db.debtPayments.count(),
        db.auditLogs.count(),
      ]);

      return await auditService.getAuditHistory(filters);
    },
    [
      filters.search,
      filters.entityType,
      filters.deletionStatus,
      filters.accountId,
      filters.personEntityId,
      filters.startDate,
      filters.endDate,
      filters.minAmount,
      filters.maxAmount,
      filters.sortByField,
      filters.sortByDirection,
    ],
    undefined,
  );

  return {
    records: auditData || [],
    isLoading: auditData === undefined,
  };
};

export default useAuditHistory;
