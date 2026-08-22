"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
    onMenuClick: () => void
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
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
            <span className="text-base font-semibold"></span>
        </header>
    )
}
