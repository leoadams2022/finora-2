// src/hooks/useNetWorth.js

import { useLiveQuery } from "dexie-react-hooks";
import { netWorthService } from "../services/netWorthService";

export const useNetWorth = (targetViewCurrency = null) => {
  const liveSummary = useLiveQuery(
    async () => {
      return await netWorthService.getLiveNetWorthSummary(targetViewCurrency);
    },
    [targetViewCurrency],
    null,
  );

  const snapshots = useLiveQuery(
    async () => {
      return await netWorthService.getSnapshots();
    },
    [],
    [],
  );

  return {
    liveSummary,
    snapshots: snapshots || [],
    isLoading: liveSummary === null,
  };
};
