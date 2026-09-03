"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { courses } from "@/data/courses";
import type { YearKey } from "@/lib/types";

const YEAR_FILTERS: { key: "all" | YearKey; label: string }[] = [
    { key: "all", label: "All years" },
    { key: "y1", label: "Year 1" },
    { key: "y2", label: "Year 2" },
    { key: "y3", label: "Year 3" },
];

function yearLabel(year: YearKey) {
    return `Year ${year.slice(1)}`;
}

export default function CoursesPage() {
    const [query, setQuery] = useState("");
    const [yearFilter, setYearFilter] = useState<"all" | YearKey>("all");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return courses.filter((course) => {
            if (yearFilter !== "all" && course.year !== yearFilter) return false;
            if (!q) return true;
            return (
                course.code.toLowerCase().includes(q) ||
                course.name.toLowerCase().includes(q)
            );
        });
    }, [query, yearFilter]);

    const grouped = useMemo(() => {
        const years: YearKey[] = ["y1", "y2", "y3"];
        return years
            .map((year) => ({
                year,
                courses: filtered.filter((course) => course.year === year),
            }))
            .filter((group) => group.courses.length > 0);
    }, [filtered]);

    return (
        <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">Courses</h1>
                    <p className="text-muted-foreground">
                        Open a course to read approved student advice and questions, or share what you know.
                    </p>
                </div>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search by code or name..."
                            className="pl-9"
                            aria-label="Search courses"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {YEAR_FILTERS.map((filter) => (
                            <Button
                                key={filter.key}
                                variant={yearFilter === filter.key ? "default" : "outline"}
                                size="sm"
                                onClick={() => setYearFilter(filter.key)}
                            >
                                {filter.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Search />
                            </EmptyMedia>
                            <EmptyTitle>No courses found</EmptyTitle>
                            <EmptyDescription>
                                Try a different search or year filter.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <div className="space-y-10">
                        {grouped.map((group) => (
                            <section key={group.year}>
                                <h2 className="mb-4 text-xl font-semibold">{yearLabel(group.year)}</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {group.courses.map((course) => (
                                        <Link key={course.id} href={`/course/${course.id}`} className="group">
                                            <Card className="h-full transition-colors group-hover:bg-muted/50">
                                                <CardHeader>
                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                        <Badge variant="outline">{course.code}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {course.credits} credits
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-lg leading-tight">
                                                        {course.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        View advice and questions
                                                    </CardDescription>
                                                </CardHeader>
                                                {course.description && (
                                                    <CardContent>
                                                        <p className="line-clamp-3 text-sm text-muted-foreground">
                                                            {course.description}
                                                        </p>
                                                    </CardContent>
                                                )}
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
