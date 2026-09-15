import { useLiveQuery } from "dexie-react-hooks";
import db from "../db/database";

export const usePeopleEntities = () => {
  const peopleEntities = useLiveQuery(
    () => db.peopleEntities.toArray(),
    [],
    [],
  );

  return {
    peopleEntities: peopleEntities || [],
    isLoading: peopleEntities === undefined,
  };
};
