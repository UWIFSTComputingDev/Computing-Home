"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export function AdminShell({ children }: { children: ReactNode }) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    return (
        <div data-admin-shell className="min-h-screen">
            <AdminSidebar />
            <AdminMobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
            <div className="flex min-h-screen flex-col bg-muted/20 md:pl-64">
                <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
                <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    )
}
