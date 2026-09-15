// src/hooks/useTransactions.js

import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useTransactions = (
  filters = {},
  sortBy = { field: "createdAt", direction: "desc" },
) => {
  const transactionsData = useLiveQuery(
    async () => {
      let collection = db.transactions.filter((t) => t.isDeleted !== true);

      // 1. Account filter
      if (filters.accountId) {
        collection = collection.filter(
          (t) => t.accountId === filters.accountId,
        );
      }
      // 2. Type filter
      if (filters.type) {
        collection = collection.filter((t) => t.type === filters.type);
      }
      // 3. Category filter
      if (filters.categoryId) {
        collection = collection.filter(
          (t) => t.categoryId === filters.categoryId,
        );
      }
      // 4. Subcategory filter
      if (filters.subcategoryId) {
        collection = collection.filter(
          (t) => t.subcategoryId === filters.subcategoryId,
        );
      }
      // 5. Tag filter
      if (filters.tag) {
        collection = collection.filter(
          (t) => Array.isArray(t.tags) && t.tags.includes(filters.tag),
        );
      }
      // 6. Date Range filter
      if (filters.startDate) {
        collection = collection.filter((t) => t.date >= filters.startDate);
      }
      if (filters.endDate) {
        collection = collection.filter((t) => t.date <= filters.endDate);
      }
      // 7. Amount Range filter
      if (filters.minAmount !== undefined && filters.minAmount !== "") {
        const min = Number(filters.minAmount);
        collection = collection.filter((t) => Number(t.amount) >= min);
      }
      if (filters.maxAmount !== undefined && filters.maxAmount !== "") {
        const max = Number(filters.maxAmount);
        collection = collection.filter((t) => Number(t.amount) <= max);
      }

      let list = await collection.toArray();

      // Fetch Categories to support sorting by category name
      const categoriesMap = new Map();
      if (sortBy.field === "category") {
        const cats = await db.categories.toArray();
        cats.forEach((c) => categoriesMap.set(c.id, c.name.toLowerCase()));
      }

      // 8. Dynamic Sorting
      list.sort((a, b) => {
        let valA, valB;

        if (sortBy.field === "amount") {
          valA = Number(a.amount);
          valB = Number(b.amount);
        } else if (sortBy.field === "type") {
          valA = a.type;
          valB = b.type;
        } else if (sortBy.field === "category") {
          valA = categoriesMap.get(a.categoryId) || "";
          valB = categoriesMap.get(b.categoryId) || "";
        } else {
          // Default or date/createdAt sorting: sort strictly by creation timestamp
          valA = a.createdAt || a.id || "";
          valB = b.createdAt || b.id || "";
        }

        // Primary comparison
        if (valA < valB) return sortBy.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortBy.direction === "asc" ? 1 : -1;

        // Secondary tie-breaker fallback by ID
        const idA = a.id || "";
        const idB = b.id || "";
        if (idA < idB) return sortBy.direction === "asc" ? -1 : 1;
        if (idA > idB) return sortBy.direction === "asc" ? 1 : -1;

        return 0;
      });

      return list;
    },
    [
      filters.accountId,
      filters.type,
      filters.categoryId,
      filters.subcategoryId,
      filters.tag,
      filters.startDate,
      filters.endDate,
      filters.minAmount,
      filters.maxAmount,
      sortBy.field,
      sortBy.direction,
    ],
    [],
  );

  return {
    transactions: transactionsData || [],
    isLoading: transactionsData === undefined,
  };
};

export default useTransactions;
