import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";

import { db } from "@/db";
import { courses } from "@/db/schema";
import type { Course, YearKey } from "@/lib/types";

const COURSES_CACHE_TAG = "courses";

function toCourse(row: typeof courses.$inferSelect): Course {
    return {
        id: row.id,
        code: row.code,
        name: row.name,
        credits: row.credits,
        year: row.year as YearKey,
        offered: row.offered as Course["offered"],
        prereqs: row.prereqs.length ? row.prereqs.map((prereq) => prereq.replace(/\s+/g, "").toUpperCase()) : undefined,
        degrees: row.degrees.map((degree) => degree.replace(/\s+/g, "").toUpperCase()),
        description: row.description ?? undefined,
    };
}

async function loadCourses(): Promise<Course[]> {
    const rows = await db.select().from(courses).orderBy(asc(courses.code));
    return rows.map(toCourse);
}

export const getCourses = unstable_cache(loadCourses, ["courses"], {
    tags: [COURSES_CACHE_TAG],
});

export async function getCourseById(id: string) {
    return (await getCourses()).find((course) => course.id === id);
}

export async function getCoursesByYear(year: YearKey) {
    return (await getCourses()).filter((course) => course.year === year);
}

export function courseCacheTag() {
    return COURSES_CACHE_TAG;
}