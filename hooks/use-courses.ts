"use client";

import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from "react";
import type { Course } from "@/lib/types";

const CoursesContext = createContext<{ courses: Course[]; isLoading: boolean } | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = () => fetch("/api/courses", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) throw new Error("Unable to load courses.");
                return response.json() as Promise<Course[]>;
            })
            .then((items) => {
                if (active) setCourses(items);
            })
            .catch(() => {
                if (active) setCourses([]);
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        void load();
        window.addEventListener("courses-changed", load);

        return () => {
            active = false;
            window.removeEventListener("courses-changed", load);
        };
    }, []);

    return createElement(CoursesContext.Provider, { value: { courses, isLoading } }, children);
}

export function useCourses() {
    const value = useContext(CoursesContext);
    if (!value) throw new Error("useCourses must be used within CoursesProvider");
    return value;
}