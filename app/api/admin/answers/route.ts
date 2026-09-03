import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { answers, profiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    // Get all answers (all statuses for moderation)
    const rows = await db
        .select({
            id: answers.id,
            questionId: answers.questionId,
            content: answers.content,
            status: answers.status,
            rejectionReason: answers.rejectionReason,
            userId: answers.userId,
            anonymousAuthorName: answers.anonymousAuthorName,
            createdAt: answers.createdAt,
            displayName: profiles.displayName,
        })
        .from(answers)
        .leftJoin(profiles, eq(profiles.userId, answers.userId));

    const answersData = rows.map((row) => ({
        id: row.id,
        questionId: row.questionId,
        content: row.content,
        status: row.status,
        rejectionReason: row.rejectionReason,
        author: row.displayName || row.anonymousAuthorName || "Anonymous",
        createdAt: row.createdAt,
    }));

    return NextResponse.json({ answers: answersData });
}
