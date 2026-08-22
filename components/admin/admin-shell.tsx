"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export function AdminShell({ children }: { children: ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    return (
        <div className="min-h-screen">
            <AdminSidebar />
            <AdminMobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
            <div className="flex min-h-screen flex-col md:pl-64">
                <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
                <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>
        </div>
    )
}
