"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import type { Course } from "@/lib/types"
import { useEffect, useState } from "react"

interface CourseChipProps {
  course: Course
  onRemove?: () => void
  isDragging?: boolean
}

export function CourseChip({ course, onRemove, isDragging }: CourseChipProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: course.id,
    data: { course },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;


  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex items-center gap-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--card)] px-3 py-2 shadow-sm transition-all hover:border-[color:var(--primary-color)]/50 hover:shadow-md"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab touch-none text-[color:var(--muted)] hover:text-[color:var(--primary-color)] active:cursor-grabbing"
        aria-label="Drag course"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-[color:var(--text)]">{course.code}</div>
        <div className="text-xs text-[color:var(--muted)] truncate">{course.name}</div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[color:var(--primary-color)]/10 px-2 py-0.5 text-xs font-medium text-[color:var(--primary-color)]">
          {course.credits}
        </span>
        {onRemove && (
          <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 text-[color:var(--muted)] hover:text-red-500 transition-all"
            aria-label="Remove course"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
