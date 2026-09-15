import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";
import { calculateAccountBalance } from "../finance/balances";

export const useAccounts = (includeArchived = false) => {
  const accountsData = useLiveQuery(
    async () => {
      // Fetch accounts based on archived filter
      let accountList;
      if (includeArchived) {
        accountList = await db.accounts.toArray();
      } else {
        accountList = await db.accounts
          .filter((acc) => acc.isActive !== false)
          .toArray();
      }

      // Read transactionLines count/keys to establish a live query dependency
      await db.transactionLines.count();

      // Compute current live balance for every account dynamically
      const accountsWithBalances = await Promise.all(
        accountList.map(async (acc) => {
          const currentBalance = await calculateAccountBalance(acc.id);
          return {
            ...acc,
            currentBalance,
          };
        }),
      );

      return accountsWithBalances;
    },
    [includeArchived],
    [],
  );

  return {
    accounts: accountsData || [],
    isLoading: accountsData === undefined,
  };
};
