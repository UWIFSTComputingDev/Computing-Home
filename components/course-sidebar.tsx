"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { CourseChip } from "./course-chip";
import { getCoursesByYear } from "@/data/courses";
import { useRoadmap } from "@/context/roadmap-context";
import type { YearKey } from "@/lib/types";

const YEARS: { key: YearKey; label: string; idx: 1|2|3 }[] = [
  { key: "y1", label: "Year 1", idx: 1 },
  { key: "y2", label: "Year 2", idx: 2 },
  { key: "y3", label: "Year 3", idx: 3 },
];

export function CourseSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  // keep expand state by numeric index for the UI toggle
  const [expandedYears, setExpandedYears] = useState<Record<1|2|3, boolean>>({
    1: true,
    2: true,
    3: true,
  });
  const { roadmap } = useRoadmap();

  const toggleYear = (idx: 1|2|3) =>
    setExpandedYears(prev => ({ ...prev, [idx]: !prev[idx] }));

  const isCoursePlaced = (courseId: string): boolean =>
    Object.values(roadmap).some(year =>
      Object.values(year).some(sem => sem.includes(courseId))
    );

  const filterCourses = (yearKey: YearKey) => {
    const q = searchQuery.toLowerCase();
    return getCoursesByYear(yearKey).filter(
      c =>
        !isCoursePlaced(c.id) &&
        (c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    );
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-[color:var(--border-color)] bg-[color:var(--card)] p-4">
      <div>
        <h3 className="mb-3 text-lg font-bold text-[color:var(--text)]">Courses</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[color:var(--border-color)] bg-[color:var(--bg)] py-2 pl-10 pr-4 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary-color)] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary-color)]"
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {YEARS.map(({ key, label, idx }) => {
          const list = filterCourses(key);
          const isExpanded = expandedYears[idx];

          return (
            <div key={key}>
              <button
                onClick={() => toggleYear(idx)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-semibold text-[color:var(--text)] hover:bg-[color:var(--bg)] transition-colors"
              >
                <span>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[color:var(--muted)]">{list.length}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[color:var(--muted)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[color:var(--muted)]" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="mt-2 space-y-2 pl-2">
                  {list.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[color:var(--muted)]">
                      {searchQuery ? "No courses found" : "All courses placed"}
                    </p>
                  ) : (
                    list.map(course => <CourseChip key={course.id} course={course} />)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
