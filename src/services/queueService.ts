import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface QueueDB extends DBSchema {
  actions: {
    key: number;
    value: {
      url: string;
      method: string;
      body: unknown;
      timestamp: number;
    };
    indexes: { "by-timestamp": number };
  };
}

let dbPromise: Promise<IDBPDatabase<QueueDB>>;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<QueueDB>("queue-db", 1, {
      upgrade(db) {
        const store = db.createObjectStore("actions", { keyPath: "timestamp" });
        store.createIndex("by-timestamp", "timestamp");
      },
    });
  }
  return dbPromise;
}

export async function addToQueue(action: Omit<QueueDB["actions"]["value"], "timestamp">) {
  const db = await getDb();
  await db.add("actions", { ...action, timestamp: Date.now() });
}

export async function getQueue() {
  const db = await getDb();
  return db.getAllFromIndex("actions", "by-timestamp");
}

export async function clearQueue() {
  const db = await getDb();
  await db.clear("actions");
}
