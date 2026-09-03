import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, submissions } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    // Get all submissions (all statuses for moderation)
    const rows = await db
        .select({
            id: submissions.id,
            courseId: submissions.courseId,
            type: submissions.type,
            title: submissions.title,
            content: submissions.content,
            status: submissions.status,
            rejectionReason: submissions.rejectionReason,
            userId: submissions.userId,
            anonymousAuthorName: submissions.anonymousAuthorName,
            createdAt: submissions.createdAt,
            displayName: profiles.displayName,
        })
        .from(submissions)
        .leftJoin(profiles, eq(profiles.userId, submissions.userId));

    const submissionsData = rows.map((row) => ({
        id: row.id,
        courseId: row.courseId,
        type: row.type,
        title: row.title,
        content: row.content,
        status: row.status,
        rejectionReason: row.rejectionReason,
        author: row.displayName || row.anonymousAuthorName || "Anonymous",
        createdAt: row.createdAt,
    }));

    return NextResponse.json({ submissions: submissionsData });
}
