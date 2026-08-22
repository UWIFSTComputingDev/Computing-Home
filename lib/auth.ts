import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, sessions, users } from "@/db/schema";

export const SESSION_COOKIE_NAME = "computing_home_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
}

export function generateSessionToken() {
    return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export function setSessionCookie(response: NextResponse, token: string) {
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
    });
}

export async function createSession(userId: string) {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await db.insert(sessions).values({
        userId,
        tokenHash: hashSessionToken(token),
        expiresAt,
    });

    return { token, expiresAt };
}

export async function destroySession(token: string) {
    const hashedToken = hashSessionToken(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, hashedToken));
}

export async function getUserBySessionToken(token: string | undefined) {
    if (!token) {
        return null;
    }

    const hashedToken = hashSessionToken(token);
    const sessionRecord = await db.query.sessions.findFirst({
        where: eq(sessions.tokenHash, hashedToken),
    });

    if (!sessionRecord) {
        return null;
    }

    if (new Date(sessionRecord.expiresAt) < new Date()) {
        await db.delete(sessions).where(eq(sessions.tokenHash, hashedToken));
        return null;
    }

    const sessionUser = await db.query.users.findFirst({
        where: eq(users.id, sessionRecord.userId),
    });

    if (!sessionUser) {
        return null;
    }

    if (sessionUser.banned) {
        // Banned users are immediately logged out.
        await db.delete(sessions).where(eq(sessions.tokenHash, hashedToken));
        return null;
    }

    const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, sessionRecord.userId),
    });

    const { passwordHash, ...safeUser } = sessionUser;

    return {
        ...safeUser,
        profile: userProfile,
    };
}

export async function getCurrentUser(request: NextRequest) {
    return getUserBySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

// For use in Server Components/layouts where only a cookie store (from next/headers) is available.
export async function getCurrentUserFromCookieStore(cookieStore: Pick<NextRequest["cookies"], "get">) {
    return getUserBySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireAuth(request: NextRequest) {
    const user = await getCurrentUser(request);

    if (!user) {
        return {
            user: null,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    return { user, response: null };
}

export async function requireRole(
    request: NextRequest,
    allowedRoles: Array<"user" | "admin">,
) {
    const auth = await requireAuth(request);

    if (!auth.user || !allowedRoles.includes(auth.user.role)) {
        return {
            user: null,
            response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
        };
    }

    return { user: auth.user, response: null };
}
