import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const usePeopleEntities = () => {
  const peopleEntities = useLiveQuery(
    async () => {
      const list = await db.peopleEntities.toArray();
      return list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    },
    [],
    [],
  );

  return {
    peopleEntities: peopleEntities || [],
    isLoading: peopleEntities === undefined,
  };
};
