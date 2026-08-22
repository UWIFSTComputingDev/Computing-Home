"use client"

import type { YearKey } from "@/lib/types"

interface YearTabsProps {
  active: YearKey
  onChange: (year: YearKey) => void
}

const years: { key: YearKey; label: string }[] = [
  { key: "y1", label: "Year 1" },
  { key: "y2", label: "Year 2" },
  { key: "y3", label: "Year 3" },
]

export function YearTabs({ active, onChange }: YearTabsProps) {
  return (
    <div className="flex gap-2 border-b border-[color:var(--border-color)]">
      {years.map((year) => (
        <button
          key={year.key}
          onClick={() => onChange(year.key)}
          className={`px-6 py-3 font-medium transition-all ${
            active === year.key
              ? "border-b-2 border-[color:var(--primary-color)] text-[color:var(--primary-color)]"
              : "text-[color:var(--muted)] hover:text-[color:var(--text)]"
          }`}
        >
          {year.label}
        </button>
      ))}
    </div>
  )
}
