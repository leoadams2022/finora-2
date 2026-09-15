import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useTransfers = (filters = {}) => {
  const transfersData = useLiveQuery(
    async () => {
      let collection = db.transactions.filter(
        (t) => t.isDeleted !== true && t.type === "transfer",
      );

      if (filters.sourceAccountId) {
        collection = collection.filter(
          (t) => t.accountId === filters.sourceAccountId,
        );
      }
      if (filters.destinationAccountId) {
        collection = collection.filter(
          (t) => t.destinationAccountId === filters.destinationAccountId,
        );
      }

      const list = await collection.toArray();
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    [filters.sourceAccountId, filters.destinationAccountId],
    [],
  );

  // console.log({ transfers: transfersData });

  return {
    transfers: transfersData || [],
    isLoading: transfersData === undefined,
  };
};
