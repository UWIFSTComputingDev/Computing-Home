import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { classrooms } from "@/db/schema";
import { requireRole } from "@/lib/auth";

const classroomSchema = z.object({
    code: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    directions: z.string().trim().min(1).max(1000),
});

export async function GET(request: Request) {
    // Execute query
    const rows = await db
        .select()
        .from(classrooms);

    return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    const parsed = classroomSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid classroom data." }, { status: 400 });
    }

    try {
        const [classroom] = await db.insert(classrooms).values(parsed.data).returning();
        return NextResponse.json({ classroom }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "A classroom with that timetable name may already exist." }, { status: 409 });
    }
}

export async function PATCH(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    const payload = await request.json().catch(() => null);
    const originalCode = typeof payload?.originalCode === "string" ? payload.originalCode.trim() : "";
    const parsed = classroomSchema.safeParse(payload);

    if (!originalCode || !parsed.success) {
        return NextResponse.json({ error: "Invalid classroom data." }, { status: 400 });
    }

    try {
        const [classroom] = await db
            .update(classrooms)
            .set(parsed.data)
            .where(eq(classrooms.code, originalCode))
            .returning();

        if (!classroom) {
            return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
        }

        return NextResponse.json({ classroom });
    } catch {
        return NextResponse.json({ error: "A classroom with that timetable name may already exist." }, { status: 409 });
    }
}

export async function DELETE(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);

    if (response) {
        return response;
    }

    const payload = await request.json().catch(() => null);
    const code = typeof payload?.code === "string" ? payload.code.trim() : "";

    if (!code) {
        return NextResponse.json({ error: "Classroom code is required." }, { status: 400 });
    }

    const [deletedClassroom] = await db
        .delete(classrooms)
        .where(eq(classrooms.code, code))
        .returning({ code: classrooms.code });

    if (!deletedClassroom) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}