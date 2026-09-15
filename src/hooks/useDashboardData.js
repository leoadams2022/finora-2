// src/hooks/useDashboardData.js

import { useLiveQuery } from "dexie-react-hooks";
import { dashboardService } from "../services/dashboardService";

export const useDashboardData = (
  dateFilter = "this_month",
  customStart = null,
  customEnd = null,
  viewCurrency = null,
) => {
  const dashboardData = useLiveQuery(
    async () => {
      return await dashboardService.getDashboardSummary(
        dateFilter,
        customStart,
        customEnd,
        viewCurrency,
      );
    },
    [dateFilter, customStart, customEnd, viewCurrency],
    null,
  );

  return {
    data: dashboardData,
    isLoading: dashboardData === null,
  };
};
