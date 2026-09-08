import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, submissions } from "@/db/schema";
import { getCourseById } from "@/lib/courses";

export async function GET(request: Request, { params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    // Validate course exists
    if (!(await getCourseById(courseId))) {
        return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Get query parameters for filtering by type
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "advice" or "question"

    // Build where conditions
    const whereConditions = [
        eq(submissions.courseId, courseId),
        eq(submissions.status, "approved"),
    ];

    if (type === "advice" || type === "question") {
        whereConditions.push(eq(submissions.type, type));
    }

    // Execute query with all conditions
    const rows = await db
        .select({
            id: submissions.id,
            courseId: submissions.courseId,
            type: submissions.type,
            title: submissions.title,
            content: submissions.content,
            userId: submissions.userId,
            anonymousAuthorName: submissions.anonymousAuthorName,
            createdAt: submissions.createdAt,
            displayName: profiles.displayName,
        })
        .from(submissions)
        .leftJoin(profiles, eq(profiles.userId, submissions.userId))
        .where(and(...whereConditions));

    // Transform response to include author info
    const submissionsData = rows.map((row) => ({
        id: row.id,
        courseId: row.courseId,
        type: row.type,
        title: row.title,
        content: row.content,
        author: row.displayName || row.anonymousAuthorName || "Anonymous",
        createdAt: row.createdAt,
    }));

    return NextResponse.json({ submissions: submissionsData });
}
