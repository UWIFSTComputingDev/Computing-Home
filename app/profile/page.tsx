import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserFromCookieStore } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const user = await getCurrentUserFromCookieStore(cookieStore);

    if (!user) {
        redirect("/auth");
    }

    const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

    return (
        <div className="flex min-h-screen flex-col">
            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:py-10">
                <div>
                    <h1 className="text-2xl font-semibold">Your profile</h1>
                    <p className="text-sm text-muted-foreground">
                        Update how you appear to others across the department portal.
                    </p>
                </div>

                <ProfileEditForm
                    initialProfile={
                        profile
                            ? {
                                displayName: profile.displayName,
                                bio: profile.bio,
                                avatarUrl: profile.avatarUrl,
                                position: profile.position,
                            }
                            : null
                    }
                />
            </main>
        </div>
    );
}
