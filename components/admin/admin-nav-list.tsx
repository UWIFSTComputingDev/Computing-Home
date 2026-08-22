"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { adminNavSections } from "@/lib/admin-nav"
import { cn } from "@/lib/utils"

export function AdminNavList({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()

    return (
        <nav className="flex flex-col gap-6">
            {adminNavSections.map((section) => (
                <div key={section.title} className="flex flex-col gap-1">
                    <span className="px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                        {section.title}
                    </span>
                    {section.items.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                                )}
                            >
                                <Icon className="size-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            ))}
        </nav>
    )
}
