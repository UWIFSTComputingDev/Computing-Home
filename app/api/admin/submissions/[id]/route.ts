import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const moderateSchema = z.object({
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().trim().max(500).optional(),
});

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

    // Find submission
    const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, id as any),
    });

    if (!submission) {
        return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    // Update submission
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

    const [updatedSubmission] = await db
        .update(submissions)
        .set(updateData)
        .where(eq(submissions.id, id as any))
        .returning();

    return NextResponse.json({ submission: updatedSubmission });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { user: admin, response } = await requireRole(request, ["admin"]);

    if (response || !admin) {
        return response;
    }

    const { id } = await params;

    // Verify submission exists
    const submission = await db.query.submissions.findFirst({
        where: eq(submissions.id, id as any),
    });

    if (!submission) {
        return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    // Delete submission (cascade deletes answers)
    await db.delete(submissions).where(eq(submissions.id, id as any));

    return NextResponse.json({ success: true });
}
