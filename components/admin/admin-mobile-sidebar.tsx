"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AdminNavList } from "@/components/admin/admin-nav-list"

interface AdminMobileSidebarProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AdminMobileSidebar({ open, onOpenChange }: AdminMobileSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-64 border-sidebar-border bg-sidebar p-0 [&>button]:text-sidebar-foreground"
            >
                <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-4">
                    <SheetTitle className="text-sidebar-foreground">Admin</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <AdminNavList onNavigate={() => onOpenChange(false)} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
