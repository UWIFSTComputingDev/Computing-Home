import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { profiles, uploadedFiles } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
    const { user, response } = await requireAuth(request);

    if (response || !user) {
        return response;
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");

    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json({ error: "Only PNG, JPEG, WEBP, or GIF images are allowed." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Image must be smaller than 5MB." }, { status: 400 });
    }

    const existingProfile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

    if (!existingProfile) {
        return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const content = Buffer.from(await file.arrayBuffer());

    const [uploadedFile] = await db
        .insert(uploadedFiles)
        .values({
            filename: file.name,
            mimeType: file.type,
            content,
        })
        .returning();

    const avatarUrl = `/api/uploads/${uploadedFile.id}`;

    const [updatedProfile] = await db
        .update(profiles)
        .set({ avatarUrl, updatedAt: new Date() })
        .where(eq(profiles.userId, user.id))
        .returning();

    return NextResponse.json({ profile: updatedProfile, avatarUrl });
}
