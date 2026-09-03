import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { answers, profiles, submissions } from "@/db/schema";

export async function GET(request: Request, { params }: { params: Promise<{ questionId: string }> }) {
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
