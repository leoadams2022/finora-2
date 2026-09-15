import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const useTags = () => {
  const tags = useLiveQuery(() => db.tags.toArray(), [], []);

  return {
    tags: tags || [],
    isLoading: tags === undefined,
  };
};
