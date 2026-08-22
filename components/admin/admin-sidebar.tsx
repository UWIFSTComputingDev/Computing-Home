import { AdminNavList } from "@/components/admin/admin-nav-list"

export function AdminSidebar() {
    return (
        <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-sidebar-border md:bg-sidebar">
            <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <span className="text-lg font-semibold text-sidebar-foreground">Admin</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <AdminNavList />
            </div>
        </aside>
    )
}
