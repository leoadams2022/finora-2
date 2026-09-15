// src/hooks/useRecurringTransactions.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useRecurringTransactions = () => {
  const recurringList = useLiveQuery(
    async () => {
      return await db.recurringTransactions.toArray();
    },
    [],
    [],
  );

  return {
    recurringTransactions: recurringList || [],
    isLoading: recurringList === undefined,
  };
};
