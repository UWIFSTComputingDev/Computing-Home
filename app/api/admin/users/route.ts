import { desc, eq } from "drizzle-orm";
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
        .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: rows });
}
