import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { courses } from "@/db/schema";
import { courseCacheTag, getCourses } from "@/lib/courses";
import { requireRole } from "@/lib/auth";

const normalizeCode = (value: string) => value.replace(/\s+/g, "").toUpperCase();
const normalizeDegree = (value: string) => value.replace(/\s+/g, "").toUpperCase();
const prerequisiteCode = z.string().transform(normalizeCode).pipe(z.string().regex(/^[A-Z0-9]+$/, "Prerequisites may only contain letters and numbers."));

const courseSchema = z.object({
    id: z.string().transform(normalizeCode).pipe(z.string().min(1).max(30)),
    code: z.string().transform(normalizeCode).pipe(z.string().min(1).max(30)),
    name: z.string().trim().min(1).max(200),
    credits: z.number().int().positive().max(30),
    year: z.enum(["y1", "y2", "y3", "y4"]),
    offered: z.array(z.enum(["s1", "s2", "s3"])).min(1),
    prereqs: z.array(prerequisiteCode.pipe(z.string().min(1).max(30))).default([]),
    degrees: z.array(z.string().transform(normalizeDegree).pipe(z.string().min(1).max(30))).min(1),
    description: z.string().trim().max(5000).nullable().optional(),
});

const validCourseSchema = courseSchema.refine((course) => course.id === course.code, {
    message: "Course ID and course code must match.",
    path: ["code"],
});

export async function GET() {
    return NextResponse.json(await getCourses());
}

export async function POST(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);
    if (response) return response;

    const parsed = validCourseSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid course data." }, { status: 400 });

    try {
        const [course] = await db.insert(courses).values(parsed.data).returning();
        revalidateTag(courseCacheTag(), "max");
        return NextResponse.json({ course }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "A course with that id or code already exists." }, { status: 409 });
    }
}

export async function PATCH(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);
    if (response) return response;

    const payload = await request.json().catch(() => null);
    const originalId = typeof payload?.originalId === "string" ? payload.originalId.trim() : "";
    const parsed = validCourseSchema.safeParse(payload);
    if (!originalId || !parsed.success) return NextResponse.json({ error: "Invalid course data." }, { status: 400 });

    try {
        const [course] = await db.update(courses).set(parsed.data).where(eq(courses.id, originalId)).returning();
        if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
        revalidateTag(courseCacheTag(), "max");
        return NextResponse.json({ course });
    } catch {
        return NextResponse.json({ error: "A course with that id or code already exists." }, { status: 409 });
    }
}

export async function DELETE(request: NextRequest) {
    const { response } = await requireRole(request, ["admin"]);
    if (response) return response;

    const payload = await request.json().catch(() => null);
    const id = typeof payload?.id === "string" ? payload.id.trim() : "";
    if (!id) return NextResponse.json({ error: "Course id is required." }, { status: 400 });

    try {
        const [deleted] = await db.delete(courses).where(eq(courses.id, id)).returning({ id: courses.id });
        if (!deleted) return NextResponse.json({ error: "Course not found." }, { status: 404 });
        revalidateTag(courseCacheTag(), "max");
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Course cannot be removed while it has submissions." }, { status: 409 });
    }
}