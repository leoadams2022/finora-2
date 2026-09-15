// src/hooks/useDebts.js
import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { calculateDebtBalance } from "../finance/debts";

export const useDebts = (
  filters = {},
  sortBy = { field: "createdAt", direction: "desc" },
) => {
  const debtsData = useLiveQuery(
    async () => {
      let collection = db.debts.filter((d) => d.isDeleted !== true);

      // 1. Direction Filter
      if (filters.direction) {
        collection = collection.filter(
          (d) => d.direction === filters.direction,
        );
      }
      // 2. Person/Entity Filter
      if (filters.personEntityId) {
        collection = collection.filter(
          (d) => d.personEntityId === filters.personEntityId,
        );
      }
      // 3. Status Filter
      if (filters.status) {
        collection = collection.filter((d) => d.status === filters.status);
      }
      // 4. Account Filter
      if (filters.accountId) {
        collection = collection.filter(
          (d) => d.accountId === filters.accountId,
        );
      }
      // 5. Start Date Filter
      if (filters.startDate) {
        collection = collection.filter(
          (d) => d.startDate === filters.startDate,
        );
      }
      // 6. Due Date Filter
      if (filters.dueDate) {
        collection = collection.filter((d) => d.dueDate === filters.dueDate);
      }
      // 7. CreatedAt Filter
      if (filters.createdAt) {
        collection = collection.filter((d) =>
          d.createdAt ? d.createdAt.startsWith(filters.createdAt) : false,
        );
      }
      // 8. Original Amount Min/Max Filter
      if (
        filters.minOriginalAmount !== undefined &&
        filters.minOriginalAmount !== ""
      ) {
        const min = Number(filters.minOriginalAmount);
        collection = collection.filter((d) => Number(d.originalAmount) >= min);
      }
      if (
        filters.maxOriginalAmount !== undefined &&
        filters.maxOriginalAmount !== ""
      ) {
        const max = Number(filters.maxOriginalAmount);
        collection = collection.filter((d) => Number(d.originalAmount) <= max);
      }

      const list = await collection.toArray();

      // Fetch People/Entities map for sorting by name
      const peopleMap = new Map();
      if (sortBy.field === "personEntityId") {
        const people = await db.peopleEntities.toArray();
        people.forEach((p) =>
          peopleMap.set(p.id, (p.name || "").toLowerCase()),
        );
      }

      // Depend on debtPayments for live reactivity
      await db.debtPayments.count();

      // Calculate debt statistics (totalPaid, remainingBalance, status)
      let resolvedList = await Promise.all(
        list.map(async (d) => {
          const stats = await calculateDebtBalance(d.id);
          return {
            ...d,
            ...stats,
          };
        }),
      );

      // 9. Total Paid Min/Max Filter (calculated values)
      if (filters.minTotalPaid !== undefined && filters.minTotalPaid !== "") {
        const min = Number(filters.minTotalPaid);
        resolvedList = resolvedList.filter((d) => Number(d.totalPaid) >= min);
      }
      if (filters.maxTotalPaid !== undefined && filters.maxTotalPaid !== "") {
        const max = Number(filters.maxTotalPaid);
        resolvedList = resolvedList.filter((d) => Number(d.totalPaid) <= max);
      }

      // 10. Remaining Balance Min/Max Filter (calculated values)
      if (
        filters.minRemainingBalance !== undefined &&
        filters.minRemainingBalance !== ""
      ) {
        const min = Number(filters.minRemainingBalance);
        resolvedList = resolvedList.filter(
          (d) => Number(d.remainingBalance) >= min,
        );
      }
      if (
        filters.maxRemainingBalance !== undefined &&
        filters.maxRemainingBalance !== ""
      ) {
        const max = Number(filters.maxRemainingBalance);
        resolvedList = resolvedList.filter(
          (d) => Number(d.remainingBalance) <= max,
        );
      }

      // 11. Sorting Logic
      resolvedList.sort((a, b) => {
        let valA, valB;

        if (sortBy.field === "personEntityId") {
          valA = peopleMap.get(a.personEntityId) || "";
          valB = peopleMap.get(b.personEntityId) || "";
        } else if (sortBy.field === "startDate") {
          valA = a.startDate || "";
          valB = b.startDate || "";
        } else if (sortBy.field === "dueDate") {
          valA = a.dueDate || "";
          valB = b.dueDate || "";
        } else if (sortBy.field === "originalAmount") {
          valA = Number(a.originalAmount || 0);
          valB = Number(b.originalAmount || 0);
        } else if (sortBy.field === "totalPaid") {
          valA = Number(a.totalPaid || 0);
          valB = Number(b.totalPaid || 0);
        } else if (sortBy.field === "remainingBalance") {
          valA = Number(a.remainingBalance || 0);
          valB = Number(b.remainingBalance || 0);
        } else if (sortBy.field === "status") {
          valA = a.status || "";
          valB = b.status || "";
        } else {
          // Default sorting by createdAt
          valA = a.createdAt || a.id || "";
          valB = b.createdAt || b.id || "";
        }

        if (valA < valB) return sortBy.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortBy.direction === "asc" ? 1 : -1;

        // Tie-breaker by ID
        const idA = a.id || "";
        const idB = b.id || "";
        if (idA < idB) return sortBy.direction === "asc" ? -1 : 1;
        if (idA > idB) return sortBy.direction === "asc" ? 1 : -1;

        return 0;
      });

      return resolvedList;
    },
    [
      filters.direction,
      filters.personEntityId,
      filters.status,
      filters.accountId,
      filters.startDate,
      filters.dueDate,
      filters.createdAt,
      filters.minOriginalAmount,
      filters.maxOriginalAmount,
      filters.minTotalPaid,
      filters.maxTotalPaid,
      filters.minRemainingBalance,
      filters.maxRemainingBalance,
      sortBy.field,
      sortBy.direction,
    ],
    [],
  );

  return {
    debts: debtsData || [],
    isLoading: debtsData === undefined,
  };
};

export default useDebts;
