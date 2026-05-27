import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("traduzai.db");
sqlite.run("PRAGMA journal_mode = WAL");

export const db = drizzle(sqlite);
export type DB = typeof db;
