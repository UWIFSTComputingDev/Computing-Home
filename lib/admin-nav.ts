import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Users, UserCog, Settings, MessageSquare } from "lucide-react"

export interface AdminNavItem {
    label: string
    href: string
    icon: LucideIcon
}

export interface AdminNavSection {
    title: string
    items: AdminNavItem[]
}

export const adminNavSections: AdminNavSection[] = [
    {
        title: "Overview",
        items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
    },
    {
        title: "Moderation",
        items: [{ label: "Course Submissions", href: "/admin/submissions", icon: MessageSquare }],
    },
    {
        title: "People",
        items: [
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "Committee Members", href: "/admin/committee-members", icon: UserCog },
        ],
    },
    {
        title: "System",
        items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
    },
]
