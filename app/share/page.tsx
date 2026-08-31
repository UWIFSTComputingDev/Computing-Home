"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, ChevronsUpDown, Search } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { courses } from "@/data/courses";
import type { Course } from "@/lib/types";

type CurrentUser = {
    id: string;
    email: string;
    role: "user" | "admin";
    profile?: {
        displayName: string;
        avatarUrl: string | null;
    };
};

type SubmissionFormValues = {
    courseId: string;
    type: "advice" | "question";
    title: string;
    content: string;
    anonymousAuthorName: string;
};

function courseLabel(course: Course) {
    return `${course.code} — ${course.name}`;
}

function CourseCombobox({
    id,
    value,
    onChange,
}: {
    id: string;
    value: string;
    onChange: (courseId: string) => void;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const selected = courses.find((course) => course.id === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter(
            (course) =>
                course.code.toLowerCase().includes(q) ||
                course.name.toLowerCase().includes(q),
        );
    }, [query]);

    useEffect(() => {
        if (!open) return;
        searchRef.current?.focus();

        function handlePointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    function selectCourse(courseId: string) {
        onChange(courseId);
        setQuery("");
        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <Button
                id={id}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-controls="course-options"
                className="h-9 w-full justify-between font-normal"
                onClick={() => {
                    setOpen((current) => !current);
                    setQuery("");
                }}
            >
                <span className={`truncate ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                    {selected ? courseLabel(selected) : "Select a course..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    <div className="border-b p-2">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by code or name..."
                                aria-label="Search courses"
                                autoComplete="off"
                                className="h-8 pl-8"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        if (filtered.length > 0) {
                                            selectCourse(filtered[0].id);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div
                        id="course-options"
                        role="listbox"
                        className="max-h-56 overflow-y-auto p-1"
                    >
                        {filtered.length === 0 ? (
                            <p className="px-2 py-3 text-sm text-muted-foreground">No courses found.</p>
                        ) : (
                            filtered.map((course) => {
                                const isSelected = course.id === value;
                                return (
                                    <button
                                        key={course.id}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => selectCourse(course.id)}
                                    >
                                        <Check
                                            className={`h-4 w-4 shrink-0 ${isSelected ? "opacity-100" : "opacity-0"}`}
                                        />
                                        <span>{courseLabel(course)}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

async function fetchCurrentUser(): Promise<CurrentUser | null> {
    try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return null;
        const data = await res.json();
        return data.user ?? null;
    } catch {
        return null;
    }
}

function ShareForm() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [userLoaded, setUserLoaded] = useState(false);
    const [submittedCourseId, setSubmittedCourseId] = useState<string | null>(null);

    const prefillCourseId = useMemo(() => {
        const courseParam = searchParams.get("course") ?? "";
        return courses.some((course) => course.id === courseParam) ? courseParam : "";
    }, [searchParams]);

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SubmissionFormValues>({
        defaultValues: {
            courseId: prefillCourseId,
            type: "advice",
            title: "",
            content: "",
            anonymousAuthorName: "",
        },
    });

    useEffect(() => {
        let cancelled = false;
        async function loadUser() {
            const currentUser = await fetchCurrentUser();
            if (!cancelled) {
                setUser(currentUser);
                setUserLoaded(true);
            }
        }
        loadUser();
        return () => {
            cancelled = true;
        };
    }, []);

    const selectedType = watch("type");
    const contentValue = watch("content") ?? "";

    const onSubmit = async (data: SubmissionFormValues) => {
        const payload: {
            courseId: string;
            type: "advice" | "question";
            title: string;
            content: string;
            anonymousAuthorName?: string;
        } = {
            courseId: data.courseId,
            type: data.type,
            title: data.title.trim(),
            content: data.content.trim(),
        };

        if (!user) {
            const name = data.anonymousAuthorName.trim();
            if (name) payload.anonymousAuthorName = name;
        }

        try {
            const res = await fetch("/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                toast({
                    title: "Could not submit",
                    description: error.error || "Failed to submit. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            setSubmittedCourseId(data.courseId);
        } catch {
            toast({
                title: "Could not submit",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        }
    };

    if (!userLoaded) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (submittedCourseId) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-12 pb-8">
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
                            <h2 className="mb-2 text-xl font-semibold">Thanks for sharing!</h2>
                            <p className="mb-6 text-muted-foreground">
                                Your submission is awaiting review. It will appear on the course page once
                                approved.
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Button asChild>
                                    <Link href={`/course/${submittedCourseId}`}>View course page</Link>
                                </Button>
                                <Button asChild variant="outline">
                                    <Link href="/">Back home</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold">Share What You Know</h1>
                    <p className="text-muted-foreground">
                        Help other computing students by sharing advice or asking a question.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>New Submission</CardTitle>
                        <CardDescription>
                            Your submission will be reviewed by administrators before being published.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Controller
                                    name="courseId"
                                    control={control}
                                    rules={{ required: "Please select a course." }}
                                    render={({ field }) => (
                                        <CourseCombobox
                                            id="course"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.courseId && (
                                    <p className="flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.courseId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Controller
                                    name="type"
                                    control={control}
                                    rules={{ required: "Please choose advice or question." }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) =>
                                                field.onChange(value as "advice" | "question")
                                            }
                                        >
                                            <SelectTrigger id="type" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="advice">Advice</SelectItem>
                                                <SelectItem value="question">Question</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder={
                                        selectedType === "question"
                                            ? "What would you like to ask?"
                                            : "Share your advice topic..."
                                    }
                                    {...register("title", {
                                        required: "Title is required.",
                                        minLength: {
                                            value: 5,
                                            message: "Title must be at least 5 characters.",
                                        },
                                        maxLength: {
                                            value: 500,
                                            message: "Title must be at most 500 characters.",
                                        },
                                    })}
                                />
                                {errors.title && (
                                    <p className="flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Message</Label>
                                <Textarea
                                    id="content"
                                    rows={6}
                                    placeholder={
                                        selectedType === "question"
                                            ? "E.g., How should I approach the assignment problem?"
                                            : "E.g., Focus on the fundamentals before diving into advanced topics..."
                                    }
                                    {...register("content", {
                                        required: "Message is required.",
                                        maxLength: {
                                            value: 5000,
                                            message: "Message must be at most 5000 characters.",
                                        },
                                    })}
                                />
                                {errors.content && (
                                    <p className="flex items-center gap-1 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.content.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {contentValue.length}/5000 characters
                                </p>
                            </div>

                            {!user && (
                                <div className="space-y-2">
                                    <Label htmlFor="author">Display name (optional)</Label>
                                    <Input
                                        id="author"
                                        placeholder="Leave blank to post as Anonymous"
                                        {...register("anonymousAuthorName", {
                                            maxLength: {
                                                value: 100,
                                                message: "Name must be at most 100 characters.",
                                            },
                                        })}
                                    />
                                    {errors.anonymousAuthorName && (
                                        <p className="flex items-center gap-1 text-sm text-destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.anonymousAuthorName.message}
                                        </p>
                                    )}
                                </div>
                            )}

                            {user && (
                                <p className="rounded-md bg-muted px-3 py-2 text-sm">
                                    Posting as{" "}
                                    <strong>{user.profile?.displayName || user.email}</strong>
                                </p>
                            )}

                            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="size-4" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Alert className="mt-8">
                    <AlertCircle />
                    <AlertDescription>
                        All submissions are reviewed before they are published. This helps keep the
                        community helpful and respectful. Pending posts are not shown on course pages.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
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
