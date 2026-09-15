// src/__tests__/setup.js
import "fake-indexeddb/auto";
import { beforeAll, beforeEach } from "vitest";
import db from "../db/database";

beforeAll(async () => {
  if (!db.isOpen()) {
    await db.open();
  }
});

beforeEach(async () => {
  if (!db.isOpen()) {
    await db.open();
  }
});
