import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useCategories = (includeInactive = false) => {
  const categories = useLiveQuery(
    async () => {
      let list;
      if (includeInactive) {
        list = await db.categories.toArray();
      } else {
        list = await db.categories
          .filter((c) => c.isActive !== false)
          .toArray();
      }

      return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
    [includeInactive],
    [],
  );

  const subcategories = useLiveQuery(
    async () => {
      let list;
      if (includeInactive) {
        list = await db.subcategories.toArray();
      } else {
        list = await db.subcategories
          .filter((s) => s.isActive !== false)
          .toArray();
      }
      return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
    [includeInactive],
    [],
  );

  return {
    categories: categories || [],
    subcategories: subcategories || [],
    isLoading: categories === undefined || subcategories === undefined,
  };
};
