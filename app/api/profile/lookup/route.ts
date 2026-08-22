import { eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const name = searchParams.get("name")?.trim();

    // ?id= takes priority over any name-based lookup.
    if (id) {
        const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, id) });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found." }, { status: 404 });
        }

        let email: string | null = null;
        if (profile.showEmail) {
            const owner = await db.query.users.findFirst({ where: eq(users.id, profile.userId) });
            email = owner?.email ?? null;
        }

        return NextResponse.json({ mode: "id" as const, profile: { ...profile, email } });
    }

    if (!name) {
        return NextResponse.json({ error: "A name or id query parameter is required." }, { status: 400 });
    }

    const selectColumns = {
        id: profiles.id,
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl,
        position: profiles.position,
        showEmail: profiles.showEmail,
        email: users.email,
    };

    // Prefer an exact (case-insensitive) match; only fall back to partial matches if none is found.
    const exactMatches = await db
        .select(selectColumns)
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(ilike(profiles.displayName, name));

    if (exactMatches.length > 0) {
        return NextResponse.json({
            mode: "search" as const,
            exact: true,
            matches: exactMatches.map((match) => ({ ...match, email: match.showEmail ? match.email : null })),
        });
    }

    const similarMatches = await db
        .select(selectColumns)
        .from(profiles)
        .innerJoin(users, eq(users.id, profiles.userId))
        .where(ilike(profiles.displayName, `%${name}%`));

    return NextResponse.json({
        mode: "search" as const,
        exact: false,
        matches: similarMatches.map((match) => ({ ...match, email: match.showEmail ? match.email : null })),
    });
}
