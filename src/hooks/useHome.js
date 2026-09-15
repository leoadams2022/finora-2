// src/hooks/useHome.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { homeService } from "../services/homeService";

export const useHome = (targetViewCurrency = null) => {
  const homeData = useLiveQuery(
    async () => {
      // Re-evaluate on changes in core tables
      await Promise.all([
        db.transactions.count(),
        db.transactionLines.count(),
        db.accounts.count(),
        db.debts.count(),
        db.debtPayments.count(),
        db.budgets.count(),
        db.currencies.count(),
      ]);

      return await homeService.getHomeSummary(targetViewCurrency);
    },
    [targetViewCurrency],
    undefined,
  );

  return {
    homeData,
    isLoading: homeData === undefined,
  };
};

export default useHome;
