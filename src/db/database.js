// src/db/database.js

import Dexie from "dexie";
import { SCHEMAS } from "./schema";
import { initializeDefaultData } from "./defaultData";

export const db = new Dexie("FinoraDatabase");

// Version 1 (Baseline)
db.version(1).stores(SCHEMAS.v1);

// Automatically seed default data when the database is first created
db.on("populate", async () => {
  await initializeDefaultData();
});

export default db;
