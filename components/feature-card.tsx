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
      className="group relative flex flex-col gap-4 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--card)] p-8 shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl hover:border-[color:var(--primary-color)]/50"
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[color:var(--primary-color)]/10 text-[color:var(--primary-color)]">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="mb-2 text-2xl font-bold text-[color:var(--text)]">{title}</h3>
        <p className="text-[color:var(--muted)] leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--primary-color)] group-hover:gap-3 transition-all">
        Learn More
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  )
}
