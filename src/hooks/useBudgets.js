// src/hooks/useBudgets.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { calculateBudgetUsage } from "../finance/budgets";

export const useBudgets = () => {
  const budgetsData = useLiveQuery(
    async () => {
      const list = await db.budgets.toArray();

      // Trigger re-evaluation when transactions change
      await db.transactions.count();

      return await Promise.all(
        list.map(async (b) => {
          const usage = await calculateBudgetUsage(b);
          return {
            ...b,
            ...usage,
          };
        }),
      );
    },
    [],
    [],
  );

  return {
    budgets: budgetsData || [],
    isLoading: budgetsData === undefined,
  };
};
