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
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
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
