import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { getCurrentUserFromCookieStore } from "@/lib/auth"

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()
    const user = await getCurrentUserFromCookieStore(cookieStore)

    if (!user) {
        redirect("/auth")
    }

    if (user.role !== "admin") {
        redirect("/")
    }

    return <AdminShell>{children}</AdminShell>
}
