"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { adminNavSections } from "@/lib/admin-nav"

interface AdminHeaderProps {
    onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname()
    const currentSection = adminNavSections.find((section) =>
        section.items.some((item) => item.href === pathname),
    )

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={onMenuClick}
                aria-label="Toggle admin navigation"
            >
                <Menu className="size-5" />
            </Button>
                <div className="min-w-0">
                    <p className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:block">Admin workspace</p>
                    <p className="truncate text-sm font-semibold text-foreground">{currentSection?.title ?? "Administration"}</p>
                </div>
            </div>
            <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href="/">
                    <ExternalLink className="size-4" />
                    <span className="hidden sm:inline">View site</span>
                </Link>
            </Button>
        </header>
    )
}
