import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const updateSchema = z.object({
    displayName: z.string().trim().min(1, "Name is required.").max(120),
    bio: z.string().trim().max(1000).nullable().optional(),
    showEmail: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
    const { user, response } = await requireAuth(request);

    if (response || !user) {
        return response;
    }

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

    if (!profile) {
        return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile });
}

export async function PATCH(request: NextRequest) {
    const { user, response } = await requireAuth(request);

    if (response || !user) {
        return response;
    }

    const payload = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid profile data." }, { status: 400 });
    }

    const { displayName, bio, showEmail } = parsed.data;

    const existingProfile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

    if (!existingProfile) {
        return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const [updatedProfile] = await db
        .update(profiles)
        .set({
            displayName,
            bio: bio || null,
            showEmail: showEmail ?? existingProfile.showEmail,
            updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.id))
        .returning();

    return NextResponse.json({ profile: updatedProfile });
}
