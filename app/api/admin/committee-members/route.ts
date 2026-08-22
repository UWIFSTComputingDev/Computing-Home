import { desc, eq, isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    const rows = await db
        .select({
            id: users.id,
            email: users.email,
            role: users.role,
            banned: users.banned,
            createdAt: users.createdAt,
            displayName: profiles.displayName,
            avatarUrl: profiles.avatarUrl,
            position: profiles.position,
        })
        .from(profiles)
        .innerJoin(users, eq(profiles.userId, users.id))
        .where(isNotNull(profiles.position))
        .orderBy(desc(profiles.updatedAt));

    return NextResponse.json({ members: rows });
}
