import { Scrypt } from "lucia";
import { lucia } from "./lucia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const scrypt = new Scrypt();

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await scrypt.hash(password);
  const user = db
    .insert(users)
    .values({
      email,
      hashedPassword,
      name: name || null,
    })
    .returning()
    .get();

  return user;
}

export async function validateUser(email: string, password: string) {
  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) return null;

  const valid = await scrypt.verify(user.hashedPassword, password);
  if (!valid) return null;

  return user;
}

export async function createSession(userId: string) {
  const session = await lucia.createSession(userId, {});
  return session;
}

export async function validateSession(sessionId: string) {
  const { user, session } = await lucia.validateSession(sessionId);
  return { user, session };
}

export async function invalidateSession(sessionId: string) {
  await lucia.invalidateSession(sessionId);
}

export function generateSessionCookie(sessionId: string) {
  return lucia.createSessionCookie(sessionId);
}

export function generateBlankSessionCookie() {
  return lucia.createBlankSessionCookie();
}
