// src/hooks/useReports.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { reportService } from "../services/reportService";

/**
 * Reactive custom hook for generating pre-calculated datasets across all report modules.
 */
export const useReports = ({
  datePreset = "this_month",
  customStart = null,
  customEnd = null,
  targetViewCurrency = null,
} = {}) => {
  const reportData = useLiveQuery(
    async () => {
      // Re-trigger query reactively when core database entities change
      await Promise.all([
        db.transactions.count(),
        db.transactionLines.count(),
        db.debts.count(),
        db.debtPayments.count(),
        db.budgets.count(),
        db.netWorthSnapshots.count(),
        db.currencies.count(),
      ]);

      return await reportService.getReportData({
        datePreset,
        customStart,
        customEnd,
        targetViewCurrency,
      });
    },
    [datePreset, customStart, customEnd, targetViewCurrency],
    undefined,
  );

  return {
    reportData,
    isLoading: reportData === undefined,
  };
};

export default useReports;
