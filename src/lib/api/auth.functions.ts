import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { createUser, validateUser } from "../auth";
import { lucia } from "../auth/lucia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signUp = createServerFn({ method: "POST" })
  .inputValidator(SignUpSchema)
  .handler(async ({ data }) => {
    const existing = db.select().from(users).where(eq(users.email, data.email)).get();
    if (existing) {
      throw new Error("Email já cadastrado");
    }

    const user = await createUser(data.email, data.password, data.name);
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    setCookie(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      secure: process.env.NODE_ENV === "production",
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator(SignInSchema)
  .handler(async ({ data }) => {
    const user = await validateUser(data.email, data.password);
    if (!user) {
      throw new Error("Email ou senha incorretos");
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    setCookie(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      secure: process.env.NODE_ENV === "production",
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const sessionId = getCookie("auth_session");
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }

  const blankCookie = lucia.createBlankSessionCookie();
  deleteCookie(blankCookie.name, { path: "/" });

  return { success: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const sessionId = getCookie("auth_session");
  if (!sessionId) return null;

  const { user } = await lucia.validateSession(sessionId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
});
