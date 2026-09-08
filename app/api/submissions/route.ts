import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCourseById } from "@/lib/courses";

const createSubmissionSchema = z.object({
    courseId: z.string().min(1, "Course is required."),
    type: z.enum(["advice", "question"]),
    title: z.string().trim().min(5, "Title must be at least 5 characters.").max(500, "Title must be at most 500 characters."),
    content: z.string().trim().min(1, "Content is required.").max(5000, "Content must be at most 5000 characters."),
    anonymousAuthorName: z.string().trim().max(100, "Name must be at most 100 characters.").optional(),
});

export async function POST(request: NextRequest) {
    const payload = await request.json().catch(() => null);
    const parsed = createSubmissionSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid submission data." },
            { status: 400 }
        );
    }

    const { courseId, type, title, content, anonymousAuthorName } = parsed.data;

    if (!(await getCourseById(courseId))) {
        return NextResponse.json({ error: "Invalid course." }, { status: 400 });
    }

    // Get current user (if logged in)
    const user = await getCurrentUser(request);

    // Create submission
    const [newSubmission] = await db
        .insert(submissions)
        .values({
            userId: user?.id ?? null,
            anonymousAuthorName: user ? null : anonymousAuthorName ?? null,
            courseId,
            type,
            title,
            content,
            status: "pending",
        })
        .returning();

    return NextResponse.json(
        {
            submission: {
                id: newSubmission.id,
                courseId: newSubmission.courseId,
                type: newSubmission.type,
                title: newSubmission.title,
                status: newSubmission.status,
                createdAt: newSubmission.createdAt,
            },
        },
        { status: 201 }
    );
}
