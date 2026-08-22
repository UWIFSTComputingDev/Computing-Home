"use client"

import { useDroppable } from "@dnd-kit/core"
import { CourseChip } from "./course-chip"
import { getCourseById } from "@/data/courses"
import type { YearKey, SemesterKey } from "@/lib/types"

interface SemesterColumnProps {
  label: string
  year: YearKey
  semester: SemesterKey
  courseIds: string[]
  totalCredits: number
  maxCredits?: number
  onRemove: (courseId: string) => void
}

export function SemesterColumn({
  label,
  year,
  semester,
  courseIds,
  totalCredits,
  maxCredits = 15,
  onRemove,
}: SemesterColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${year}-${semester}`,
    data: { year, semester },
  })

  const isOverLimit = totalCredits > maxCredits

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[color:var(--text)]">{label}</h4>
        <span
          className={`text-sm font-medium ${
            isOverLimit
              ? "text-red-500 animate-shake"
              : totalCredits === maxCredits
                ? "text-[color:var(--accent-color)]"
                : "text-[color:var(--muted)]"
          }`}
        >
          {totalCredits}/{maxCredits} credits
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-xl border-2 border-dashed p-4 transition-all ${
          isOver
            ? "border-[color:var(--primary-color)] bg-[color:var(--primary-color)]/5"
            : "border-[color:var(--border-color)] bg-[color:var(--bg)]"
        }`}
      >
        {courseIds.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-[color:var(--muted)]">Drag courses here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {courseIds.map((courseId) => {
              const course = getCourseById(courseId)
              if (!course) return null
              return <CourseChip key={courseId} course={course} onRemove={() => onRemove(courseId)} />
            })}
          </div>
        )}
      </div>
    </div>
  )
}