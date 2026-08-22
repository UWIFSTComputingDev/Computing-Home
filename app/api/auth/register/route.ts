import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(128),
    displayName: z.string().trim().min(2).max(50).optional(),
});

export async function POST(request: Request) {
    const payload = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
    }

    const { email, password, displayName } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, normalizedEmail),
    });

    if (existingUser) {
        return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const [createdUser] = await db
        .insert(users)
        .values({
            email: normalizedEmail,
            passwordHash,
            role: "user",
        })
        .returning({
            id: users.id,
            email: users.email,
            role: users.role,
        });

    const resolvedDisplayName = displayName || normalizedEmail.split("@")[0];

    await db.insert(profiles).values({
        userId: createdUser.id,
        displayName: resolvedDisplayName,
    });

    const { token } = await createSession(createdUser.id);

    const response = NextResponse.json(
        {
            user: {
                id: createdUser.id,
                email: createdUser.email,
                role: createdUser.role,
                profile: {
                    displayName: resolvedDisplayName,
                },
            },
        },
        { status: 201 },
    );

    setSessionCookie(response, token);

    return response;
}
