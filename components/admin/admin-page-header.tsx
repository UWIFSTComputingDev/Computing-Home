import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export function AdminPageHeader({
    section,
    title,
    description,
    icon: Icon,
    action,
}: {
    section: string
    title: string
    description: string
    icon: LucideIcon
    action?: ReactNode
}) {
    return (
        <header className="flex flex-col gap-5 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-4">
                <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Administration <span className="px-1 text-primary">/</span> {section}
                    </p>
                    <h1 className="admin-page-title mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {title}
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {action && <div className="sm:shrink-0">{action}</div>}
        </header>
    )
}
