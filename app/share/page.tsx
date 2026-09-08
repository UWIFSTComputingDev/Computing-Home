"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ShareSubmissionForm } from "@/components/share-submission-form";
import { Spinner } from "@/components/ui/spinner";
import { useCourses } from "@/hooks/use-courses";

function ShareForm() {
    const searchParams = useSearchParams();
    const { courses } = useCourses();
    const defaultCourseId = useMemo(() => {
        const courseParam = searchParams.get("course") ?? "";
        return courses.some((course) => course.id === courseParam) ? courseParam : "";
    }, [searchParams]);

    return <ShareSubmissionForm defaultCourseId={defaultCourseId} />;
}

export default function SharePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <Spinner className="size-8" />
                </div>
            }
        >
            <ShareForm />
        </Suspense>
    );
}
