import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type DBInstance = BunSQLiteDatabase | BetterSQLite3Database;

let db: DBInstance;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqlite: any;

const DB_PATH = process.env.VERCEL
  ? "/tmp/traduzai.db"
  : "traduzai.db";

async function init() {
  if (db) return;

  if (typeof Bun !== "undefined") {
    const _import = new Function("m", "return import(m)");
    const { Database } = (await _import("bun:sqlite")) as typeof import("bun:sqlite");
    const { drizzle } = (await _import("drizzle-orm/bun-sqlite")) as typeof import("drizzle-orm/bun-sqlite");
    sqlite = new Database(DB_PATH);
    sqlite.run("PRAGMA journal_mode = WAL");
    db = drizzle(sqlite) as unknown as DBInstance;
  } else {
    const { default: Database } = (await import("better-sqlite3")) as typeof import("better-sqlite3");
    const { drizzle } = await import("drizzle-orm/better-sqlite3");
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    db = drizzle(sqlite) as unknown as DBInstance;
  }
}

await init();

export { db, sqlite };
export type { DBInstance as DB };
