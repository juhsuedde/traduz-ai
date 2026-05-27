import { Lucia } from "lucia";
import { db, sqlite } from "../db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _lucia: Lucia<any, any>;

async function init() {
  if (_lucia) return _lucia;

  const isBun = typeof Bun !== "undefined";

  const adapter = isBun
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (await import("@lucia-auth/adapter-sqlite")).BunSQLiteAdapter(sqlite as any, {
        user: "users",
        session: "user_sessions",
      })
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (await import("@lucia-auth/adapter-sqlite")).BetterSqlite3Adapter(sqlite as any, {
        user: "users",
        session: "user_sessions",
      });

  _lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (attributes) => {
      return {
        email: attributes.email,
        name: attributes.name,
        avatarUrl: attributes.avatar_url,
      };
    },
  });

  return _lucia!;
}

const lucia = await init();

export { lucia };

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      name: string | null;
      avatar_url: string | null;
    };
  }
}
