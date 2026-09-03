import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { answers, profiles, submissions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const createAnswerSchema = z.object({
    content: z.string().trim().min(1, "Content is required.").max(5000, "Content must be at most 5000 characters."),
    anonymousAuthorName: z.string().trim().max(100, "Name must be at most 100 characters.").optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
    const { questionId } = await params;

    // Verify question exists
    const question = await db.query.submissions.findFirst({
        where: eq(submissions.id, questionId as any),
    });

    if (!question) {
        return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    if (question.type !== "question") {
        return NextResponse.json({ error: "This submission is not a question." }, { status: 400 });
    }

    // Get approved answers for this question
    const answersData = await db
        .select({
            id: answers.id,
            content: answers.content,
            userId: answers.userId,
            anonymousAuthorName: answers.anonymousAuthorName,
            createdAt: answers.createdAt,
            displayName: profiles.displayName,
        })
        .from(answers)
        .leftJoin(profiles, eq(profiles.userId, answers.userId))
        .where(and(eq(answers.questionId, questionId as any), eq(answers.status, "approved")));

    // Transform to include author info
    const transformedAnswers = answersData.map((answer) => ({
        id: answer.id,
        content: answer.content,
        author: answer.displayName || answer.anonymousAuthorName || "Anonymous",
        createdAt: answer.createdAt,
    }));

    return NextResponse.json({ answers: transformedAnswers });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
    const { questionId } = await params;

    const payload = await request.json().catch(() => null);
    const parsed = createAnswerSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid answer data." },
            { status: 400 }
        );
    }

    const { content, anonymousAuthorName } = parsed.data;

    // Verify question exists and is approved
    const question = await db.query.submissions.findFirst({
        where: eq(submissions.id, questionId as any),
    });

    if (!question) {
        return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    if (question.type !== "question") {
        return NextResponse.json({ error: "This submission is not a question." }, { status: 400 });
    }

    if (question.status !== "approved") {
        return NextResponse.json(
            { error: "This question is not available for answers." },
            { status: 400 }
        );
    }

    // Get current user (if logged in)
    const user = await getCurrentUser(request);

    // Create answer
    const [newAnswer] = await db
        .insert(answers)
        .values({
            questionId: questionId as any,
            userId: user?.id ?? null,
            anonymousAuthorName: user ? null : anonymousAuthorName ?? null,
            content,
            status: "pending",
        })
        .returning();

    return NextResponse.json(
        {
            answer: {
                id: newAnswer.id,
                questionId: newAnswer.questionId,
                content: newAnswer.content,
                status: newAnswer.status,
                createdAt: newAnswer.createdAt,
            },
        },
        { status: 201 }
    );
}
