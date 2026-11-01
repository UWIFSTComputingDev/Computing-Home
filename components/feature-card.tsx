import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  href: string
  icon?: LucideIcon
}

export function FeatureCard({ title, description, href, icon: Icon }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-64 flex-col gap-5 overflow-hidden rounded-3xl border border-[color:var(--border-color)] bg-[color:var(--card)] p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--primary-color)]/50 hover:shadow-xl sm:p-8"
    >
      <div className="pointer-events-none absolute -right-12 -top-14 size-36 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-150" />
      {Icon && (
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-[color:var(--primary-color)] shadow-inner">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <div className="relative flex-1">
        <h3 className="mb-2 text-xl font-bold tracking-tight text-[color:var(--text)] sm:text-2xl">{title}</h3>
        <p className="text-sm leading-6 text-[color:var(--muted)] sm:text-base">{description}</p>
      </div>
      <div className="relative flex items-center gap-2 text-sm font-semibold text-[color:var(--primary-color)] transition-all group-hover:gap-3">
        Explore
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  )
}
