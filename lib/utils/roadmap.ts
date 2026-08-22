// lib/utils/roadmap.ts
import type { Course, Roadmap, YearKey, SemesterKey } from "@/lib/types";

const YEAR_ORDER: YearKey[] = ["y1", "y2", "y3"];
const SEM_ORDER: SemesterKey[] = ["s1", "s2", "s3"];

function termIndex(y: YearKey, s: SemesterKey) {
  return YEAR_ORDER.indexOf(y) * SEM_ORDER.length + SEM_ORDER.indexOf(s);
}

function completedBefore(
  target: { year: YearKey; semester: SemesterKey },
  roadmap: Roadmap
): Set<string> {
  const completed = new Set<string>();
  const yearOrder: YearKey[] = ["y1", "y2", "y3"];
  const semOrder: SemesterKey[] = ["s1", "s2", "s3"];

  for (const y of yearOrder) {
    for (const s of semOrder) {
      // Stop if we've reached the current target semester
      if (y === target.year && s === target.semester) {
        return completed;
      }
      // Add all courses found in these prior terms
      roadmap[y][s].forEach(courseId => completed.add(courseId));
    }
  }
  return completed;
}

export function canPlace(
  course: Course,
  target: { year: YearKey; semester: SemesterKey },
  roadmap: Roadmap
): { ok: boolean; reason?: string } {
  // 1) Level/year must match
  if (course.year !== target.year) {
    return { 
      ok: false, 
      reason: `This is a Level ${course.year.replace('y','')} course. Please place it in the correct Year tab.` 
    };
  }

  // 2) Must be offered this semester (Fixed semName error)
  const offered = course.offered ?? [];
  if (!offered.includes(target.semester)) {
    const semName = target.semester === "s1" ? "Semester 1" : 
                    target.semester === "s2" ? "Semester 2" : 
                    "Semester 3 (Summer)";
    
    return { 
      ok: false, 
      reason: `${course.code} is not offered in ${semName}. It is only available in ${offered.join(" & ").toUpperCase()}.` 
    };
  }

  // 3) Prerequisite Check
  const prereqs = course.prereqs ?? [];
  if (prereqs.length) {
    const done = completedBefore(target, roadmap);
    const missing = prereqs.filter((p) => !done.has(p));
    
    if (missing.length) {
      return { 
        ok: false, 
        reason: `Wait! To take ${course.code}, you must first pass ${missing.join(", ")} in a previous semester.` 
      };
    }
  }

  // This MUST be the very last line
  return { ok: true };
}