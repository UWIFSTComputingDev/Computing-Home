import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { profiles, sessions, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const updateSchema = z.object({
    role: z.enum(["user", "admin"]).optional(),
    banned: z.boolean().optional(),
    bannedReason: z.string().trim().max(500).nullable().optional(),
    position: z.string().trim().max(100).nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user: admin, response } = await requireRole(request, ["admin"]);

    if (response || !admin) {
        return response;
    }

    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid update payload." }, { status: 400 });
    }

    const { role, banned, bannedReason, position } = parsed.data;

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, id) });

    if (!targetUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (id === admin.id && (banned === true || (role && role !== admin.role))) {
        return NextResponse.json({ error: "You cannot ban or change the role of your own account." }, { status: 400 });
    }

    if (role !== undefined || banned !== undefined) {
        const updates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };

        if (role !== undefined) {
            updates.role = role;
        }

        if (banned !== undefined) {
            updates.banned = banned;
            updates.bannedAt = banned ? new Date() : null;
            updates.bannedReason = banned ? bannedReason ?? targetUser.bannedReason ?? null : null;
        }

        await db.update(users).set(updates).where(eq(users.id, id));

        if (banned === true) {
            // Force logout everywhere by invalidating existing sessions.
            await db.delete(sessions).where(eq(sessions.userId, id));
        }
    }

    if (position !== undefined) {
        const existingProfile = await db.query.profiles.findFirst({ where: eq(profiles.userId, id) });

        if (existingProfile) {
            await db
                .update(profiles)
                .set({ position: position || null, updatedAt: new Date() })
                .where(eq(profiles.userId, id));
        } else if (position) {
            return NextResponse.json({ error: "User has no profile to assign a position to." }, { status: 400 });
        }
    }

    const [updatedRow] = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            banned: users.banned,
            bannedReason: users.bannedReason,
            bannedAt: users.bannedAt,
            createdAt: users.createdAt,
            displayName: profiles.displayName,
            bio: profiles.bio,
            avatarUrl: profiles.avatarUrl,
            position: profiles.position,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, id));

    return NextResponse.json({ user: updatedRow });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user: admin, response } = await requireRole(request, ["admin"]);

    if (response || !admin) {
        return response;
    }

    const { id } = await params;

    if (id === admin.id) {
        return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 });
    }

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, id) });

    if (!targetUser) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Profiles and sessions cascade-delete with the user row.
    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true });
}
