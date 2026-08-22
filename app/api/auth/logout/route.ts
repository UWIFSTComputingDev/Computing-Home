import { NextResponse } from "next/server";

import { clearSessionCookie, destroySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
    const token = request.headers.get("cookie")
        ?.split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`))
        ?.split("=")[1];

    if (token) {
        await destroySession(token);
    }

    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
}
