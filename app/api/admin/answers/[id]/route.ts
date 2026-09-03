import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { answers, profiles } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const moderateSchema = z.object({
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().trim().max(500).optional(),
});

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user: admin, response } = await requireRole(request, ["admin"]);

    if (response || !admin) {
        return response;
    }

    const { id } = await params;
    const payload = await request.json().catch(() => null);
    const parsed = moderateSchema.safeParse(payload);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid moderation data." },
            { status: 400 }
        );
    }

    const { status, rejectionReason } = parsed.data;

    // Find answer
    const answer = await db.query.answers.findFirst({
        where: eq(answers.id, id as any),
    });

    if (!answer) {
        return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Update answer
    const updateData: any = {
        status,
        updatedAt: new Date(),
    };

    if (status === "approved") {
        updateData.approvedAt = new Date();
    } else if (status === "rejected") {
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = rejectionReason ?? null;
    }

    const [updatedAnswer] = await db
        .update(answers)
        .set(updateData)
        .where(eq(answers.id, id as any))
        .returning();

    return NextResponse.json({ answer: updatedAnswer });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user: admin, response } = await requireRole(request, ["admin"]);

    if (response || !admin) {
        return response;
    }

    const { id } = await params;

    // Verify answer exists
    const answer = await db.query.answers.findFirst({
        where: eq(answers.id, id as any),
    });

    if (!answer) {
        return NextResponse.json({ error: "Answer not found." }, { status: 404 });
    }

    // Delete answer
    await db.delete(answers).where(eq(answers.id, id as any));

    return NextResponse.json({ success: true });
}
