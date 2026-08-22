import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
    const payload = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
    });

    if (!existingUser) {
        return NextResponse.json({ error: "No account found for that email." }, { status: 401 });
    }

    if (existingUser.banned) {
        return NextResponse.json(
            { error: existingUser.bannedReason || "This account has been banned." },
            { status: 403 },
        );
    }

    const validPassword = await verifyPassword(password, existingUser.passwordHash);

    if (!validPassword) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, existingUser.id),
    });

    const { token } = await createSession(existingUser.id);

    const response = NextResponse.json({
        user: {
            id: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
            profile: userProfile,
        },
    });

    setSessionCookie(response, token);

    return response;
}
