import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useCategories = (includeInactive = false) => {
  const categories = useLiveQuery(
    () => {
      if (includeInactive) {
        return db.categories.toArray();
      }
      return db.categories.filter((c) => c.isActive !== false).toArray();
    },
    [includeInactive],
    [],
  );

  const subcategories = useLiveQuery(
    () => {
      if (includeInactive) {
        return db.subcategories.toArray();
      }
      return db.subcategories.filter((s) => s.isActive !== false).toArray();
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
