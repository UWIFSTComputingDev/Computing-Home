import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const file = await db.query.uploadedFiles.findFirst({ where: eq(uploadedFiles.id, id) });

    if (!file) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    // Uploaded file rows are immutable (a new row is created per upload), so the response can be cached forever.
    return new NextResponse(new Uint8Array(file.content), {
        headers: {
            "Content-Type": file.mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
