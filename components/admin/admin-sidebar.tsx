import { AdminNavList } from "@/components/admin/admin-nav-list"
import Image from "next/image"
import Link from "next/link"

export function AdminSidebar() {
    return (
        <aside className="hidden border-r border-sidebar-border bg-sidebar md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col">
            <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-sidebar-border px-5">
                <Image
                    src="/cs_logo.png"
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-xl border border-sidebar-border bg-white p-0.5"
                />
                <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">UWI · Mona</span>
                    <span className="mt-0.5 block truncate text-sm font-bold text-sidebar-foreground">Admin workspace</span>
                </span>
            </Link>
            <div className="flex-1 overflow-y-auto px-3 py-5">
                <AdminNavList />
            </div>
            <div className="border-t border-sidebar-border px-5 py-4 text-xs text-sidebar-foreground/55">Computing Department</div>
        </aside>
    )
}
