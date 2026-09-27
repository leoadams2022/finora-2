import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useTags = () => {
  const tags = useLiveQuery(
    async () => {
      const list = await db.tags.toArray();
      return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
    [],
    [],
  );
  return {
    tags: tags || [],
    isLoading: tags === undefined,
  };
};
