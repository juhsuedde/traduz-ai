import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DBInstance = BunSQLiteDatabase | BetterSQLite3Database;

let db: DBInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite: any;

async function init() {
  if (db) return;

  if (typeof Bun !== "undefined") {
    const { Database } = await import("bun:sqlite");
    const { drizzle } = await import("drizzle-orm/bun-sqlite");
    sqlite = new Database("traduzai.db");
    sqlite.run("PRAGMA journal_mode = WAL");
    db = drizzle(sqlite) as unknown as DBInstance;
  } else {
    const Database = (await import("better-sqlite3")).default;
    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    sqlite = new Database("traduzai.db");
    sqlite.pragma("journal_mode = WAL");
    db = drizzle(sqlite) as unknown as DBInstance;
  }
}

await init();

export { db, sqlite };
export type { DBInstance as DB };
