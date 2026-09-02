"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ShareSubmissionForm } from "@/components/share-submission-form";
import { useToast } from "@/hooks/use-toast";
import { getCourseById } from "@/data/courses";

type CurrentUser = {
    id: string;
    email: string;
    role: "user" | "admin";
    profile?: {
        displayName: string;
        avatarUrl: string | null;
    };
};

interface Submission {
    id: string;
    courseId: string;
    type: "advice" | "question";
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

interface Answer {
    id: string;
    content: string;
    author: string;
    createdAt: string;
}

type AnswerFormValues = {
    content: string;
    anonymousAuthorName: string;
};

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

function yearLabel(year: string) {
    return year.startsWith("y") ? `Year ${year.slice(1)}` : year;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
}

export default function CoursePage() {
    const params = useParams<{ courseId: string }>();
    const rawCourseId = params.courseId;
    const courseId = typeof rawCourseId === "string" ? decodeURIComponent(rawCourseId) : "";
    const course = courseId ? getCourseById(courseId) : undefined;

    const { toast } = useToast();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [advice, setAdvice] = useState<Submission[]>([]);
    const [questions, setQuestions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [answersByQuestion, setAnswersByQuestion] = useState<Record<string, Answer[]>>({});
    const [answersLoading, setAnswersLoading] = useState<Record<string, boolean>>({});
    const [answersError, setAnswersError] = useState<Record<string, string>>({});
    const [submittingAnswer, setSubmittingAnswer] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [shareType, setShareType] = useState<"advice" | "question">("advice");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnswerFormValues>({
        defaultValues: { content: "", anonymousAuthorName: "" },
    });

    const loadSubmissions = useCallback(async () => {
        if (!course) return;
        setLoading(true);
        setLoadError(null);
        try {
            const res = await fetch(`/api/course/${courseId}/submissions`);
            if (!res.ok) {
                setLoadError("Could not load student advice and questions.");
                setAdvice([]);
                setQuestions([]);
                return;
            }
            const data = await res.json();
            const submissions = (data.submissions ?? []) as Submission[];
            setAdvice(submissions.filter((item) => item.type === "advice"));
            setQuestions(submissions.filter((item) => item.type === "question"));
        } catch {
            setLoadError("Could not load student advice and questions.");
            setAdvice([]);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    }, [course, courseId]);

    useEffect(() => {
        let cancelled = false;
        async function init() {
            const currentUser = await fetchCurrentUser();
            if (!cancelled) setUser(currentUser);
        }
        init();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!course) {
            setLoading(false);
            return;
        }
        void loadSubmissions();
    }, [course, loadSubmissions]);

    const loadAnswersForQuestion = async (questionId: string) => {
        setAnswersLoading((prev) => ({ ...prev, [questionId]: true }));
        setAnswersError((prev) => ({ ...prev, [questionId]: "" }));
        try {
            const res = await fetch(`/api/submissions/${questionId}/answers`);
            if (!res.ok) {
                setAnswersError((prev) => ({
                    ...prev,
                    [questionId]: "Could not load answers.",
                }));
                setAnswersByQuestion((prev) => ({ ...prev, [questionId]: [] }));
                return;
            }
            const data = await res.json();
            setAnswersByQuestion((prev) => ({ ...prev, [questionId]: data.answers ?? [] }));
        } catch {
            setAnswersError((prev) => ({
                ...prev,
                [questionId]: "Could not load answers.",
            }));
            setAnswersByQuestion((prev) => ({ ...prev, [questionId]: [] }));
        } finally {
            setAnswersLoading((prev) => ({ ...prev, [questionId]: false }));
        }
    };

    const toggleQuestion = (questionId: string) => {
        if (selectedQuestion === questionId) {
            setSelectedQuestion(null);
            return;
        }
        setSelectedQuestion(questionId);
        reset({ content: "", anonymousAuthorName: "" });
        if (answersByQuestion[questionId] === undefined) {
            void loadAnswersForQuestion(questionId);
        }
    };

    const onSubmitAnswer = async (data: AnswerFormValues, questionId: string) => {
        setSubmittingAnswer(true);
        const payload: { content: string; anonymousAuthorName?: string } = {
            content: data.content.trim(),
        };
        if (!user) {
            const name = data.anonymousAuthorName.trim();
            if (name) payload.anonymousAuthorName = name;
        }

        try {
            const res = await fetch(`/api/submissions/${questionId}/answers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                toast({
                    title: "Could not submit answer",
                    description: error.error || "Failed to submit answer.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Answer submitted",
                description: "Your answer is awaiting review. It will appear here once approved.",
            });
            reset({ content: "", anonymousAuthorName: "" });
        } catch {
            toast({
                title: "Could not submit answer",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setSubmittingAnswer(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <AlertCircle />
                        </EmptyMedia>
                        <EmptyTitle>Course not found</EmptyTitle>
                        <EmptyDescription>
                            The course you are looking for does not exist.
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button asChild variant="outline">
                        <Link href="/courses">Browse courses</Link>
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link
                        href="/courses"
                        className="mb-3 inline-block text-sm font-medium text-primary hover:underline"
                    >
                        All courses
                    </Link>
                    <Badge variant="outline" className="mb-2 block w-fit">
                        {course.code}
                    </Badge>
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    {course.description && (
                        <p className="mt-2 text-muted-foreground">{course.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{course.credits} Credits</span>
                        <span aria-hidden>•</span>
                        <span>{yearLabel(course.year)}</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <CardTitle>Student Advice & Questions</CardTitle>
                                <CardDescription>
                                    Approved advice and questions from other students. Answers appear after
                                    review.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="shrink-0"
                                onClick={() => {
                                    setShareType("advice");
                                    setShareOpen(true);
                                }}
                            >
                                Share What You Know
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadError ? (
                            <Empty className="border">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <AlertCircle />
                                    </EmptyMedia>
                                    <EmptyTitle>Could not load posts</EmptyTitle>
                                    <EmptyDescription>{loadError}</EmptyDescription>
                                </EmptyHeader>
                                <Button variant="outline" onClick={() => void loadSubmissions()}>
                                    Try again
                                </Button>
                            </Empty>
                        ) : (
                            <Tabs defaultValue="advice" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="advice">Advice ({advice.length})</TabsTrigger>
                                    <TabsTrigger value="questions">
                                        Questions ({questions.length})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="advice" className="space-y-4">
                                    {advice.length === 0 ? (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <MessageSquare />
                                                </EmptyMedia>
                                                <EmptyTitle>No advice yet</EmptyTitle>
                                                <EmptyDescription>
                                                    Be the first to share what you know about this course.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShareType("advice");
                                                    setShareOpen(true);
                                                }}
                                            >
                                                Share advice
                                            </Button>
                                        </Empty>
                                    ) : (
                                        advice.map((submission) => (
                                            <Card key={submission.id}>
                                                <CardContent className="pt-6">
                                                    <h3 className="mb-2 text-lg font-semibold">
                                                        {submission.title}
                                                    </h3>
                                                    <p className="mb-4 whitespace-pre-wrap text-muted-foreground">
                                                        {submission.content}
                                                    </p>
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                                        <span>By {submission.author}</span>
                                                        <span>{formatDate(submission.createdAt)}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="questions" className="space-y-4">
                                    {questions.length === 0 ? (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <AlertCircle />
                                                </EmptyMedia>
                                                <EmptyTitle>No questions yet</EmptyTitle>
                                                <EmptyDescription>
                                                    Be the first to start the conversation.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShareType("question");
                                                    setShareOpen(true);
                                                }}
                                            >
                                                Ask a question
                                            </Button>
                                        </Empty>
                                    ) : (
                                        questions.map((question) => {
                                            const isOpen = selectedQuestion === question.id;
                                            const answers = answersByQuestion[question.id];
                                            const isAnswersLoading = answersLoading[question.id];
                                            const answersLoadError = answersError[question.id];

                                            return (
                                                <Card key={question.id}>
                                                    <CardContent className="pt-6">
                                                        <button
                                                            type="button"
                                                            className="w-full text-left"
                                                            onClick={() => toggleQuestion(question.id)}
                                                            aria-expanded={isOpen}
                                                        >
                                                            <h3 className="mb-2 text-lg font-semibold">
                                                                {question.title}
                                                            </h3>
                                                            <p
                                                                className={`text-muted-foreground ${isOpen ? "whitespace-pre-wrap" : "line-clamp-2"}`}
                                                            >
                                                                {question.content}
                                                            </p>
                                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                                                <span>By {question.author}</span>
                                                                <span>{formatDate(question.createdAt)}</span>
                                                            </div>
                                                            <p className="mt-2 text-xs font-medium text-primary">
                                                                {isOpen ? "Hide answers" : "View answers"}
                                                            </p>
                                                        </button>

                                                        {isOpen && (
                                                            <div className="mt-6 space-y-6 border-t pt-6">
                                                                <div>
                                                                    <h4 className="mb-4 font-semibold">Answers</h4>
                                                                    {isAnswersLoading ? (
                                                                        <div className="flex justify-center py-6">
                                                                            <Spinner className="size-6" />
                                                                        </div>
                                                                    ) : answersLoadError ? (
                                                                        <div className="space-y-2">
                                                                            <p className="text-sm text-destructive">
                                                                                {answersLoadError}
                                                                            </p>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    void loadAnswersForQuestion(question.id)
                                                                                }
                                                                            >
                                                                                Try again
                                                                            </Button>
                                                                        </div>
                                                                    ) : !answers || answers.length === 0 ? (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            No answers yet. Be the first to help.
                                                                        </p>
                                                                    ) : (
                                                                        <div className="space-y-3">
                                                                            {answers.map((answer) => (
                                                                                <div
                                                                                    key={answer.id}
                                                                                    className="rounded-md bg-muted p-3"
                                                                                >
                                                                                    <p className="mb-2 whitespace-pre-wrap text-sm">
                                                                                        {answer.content}
                                                                                    </p>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {answer.author} •{" "}
                                                                                        {formatDate(answer.createdAt)}
                                                                                    </p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <form
                                                                    className="space-y-3"
                                                                    onSubmit={handleSubmit((data) =>
                                                                        onSubmitAnswer(data, question.id),
                                                                    )}
                                                                >
                                                                    <Textarea
                                                                        placeholder="Write an answer..."
                                                                        rows={4}
                                                                        {...register("content", {
                                                                            required: "Answer is required.",
                                                                            maxLength: {
                                                                                value: 5000,
                                                                                message:
                                                                                    "Answer must be at most 5000 characters.",
                                                                            },
                                                                        })}
                                                                    />
                                                                    {errors.content && (
                                                                        <p className="text-sm text-destructive">
                                                                            {errors.content.message}
                                                                        </p>
                                                                    )}

                                                                    {!user && (
                                                                        <Input
                                                                            placeholder="Your name (optional)"
                                                                            {...register("anonymousAuthorName", {
                                                                                maxLength: {
                                                                                    value: 100,
                                                                                    message:
                                                                                        "Name must be at most 100 characters.",
                                                                                },
                                                                            })}
                                                                        />
                                                                    )}

                                                                    {user && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Answering as{" "}
                                                                            <strong>
                                                                                {user.profile?.displayName || user.email}
                                                                            </strong>
                                                                        </p>
                                                                    )}

                                                                    <Button
                                                                        type="submit"
                                                                        size="sm"
                                                                        disabled={submittingAnswer}
                                                                    >
                                                                        {submittingAnswer ? (
                                                                            <>
                                                                                <Spinner className="size-3" />
                                                                                Submitting...
                                                                            </>
                                                                        ) : (
                                                                            "Submit answer"
                                                                        )}
                                                                    </Button>
                                                                </form>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Share What You Know</DialogTitle>
                            <DialogDescription>
                                Your submission will be reviewed before it appears on this course page.
                            </DialogDescription>
                        </DialogHeader>
                        <ShareSubmissionForm
                            key={`${shareOpen}-${shareType}-${course.id}`}
                            defaultCourseId={course.id}
                            defaultType={shareType}
                            lockCourse
                            embedded
                            onDone={() => setShareOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
