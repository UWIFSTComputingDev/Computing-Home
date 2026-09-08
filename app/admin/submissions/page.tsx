"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Trash2, XCircle } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/use-courses";

type ModerationStatus = "pending" | "approved" | "rejected";
type StatusFilter = "all" | ModerationStatus;
type ItemKind = "submission" | "answer";

interface Submission {
    id: string;
    courseId: string;
    type: "advice" | "question";
    title: string;
    content: string;
    status: ModerationStatus;
    rejectionReason?: string | null;
    author: string;
    createdAt: string;
}

interface Answer {
    id: string;
    questionId: string;
    content: string;
    status: ModerationStatus;
    rejectionReason?: string | null;
    author: string;
    createdAt: string;
}

type PendingAction =
    | { type: "reject"; kind: ItemKind; id: string }
    | { type: "delete"; kind: ItemKind; id: string; isQuestion?: boolean };

function statusVariant(status: ModerationStatus) {
    if (status === "pending") return "secondary" as const;
    if (status === "approved") return "default" as const;
    return "destructive" as const;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
}

export default function SubmissionsPage() {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState<Submission[] | null>(null);
    const [answers, setAnswers] = useState<Answer[] | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
    const [viewItem, setViewItem] = useState<Submission | Answer | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [busy, setBusy] = useState(false);
    const { courses } = useCourses();

    function courseBadgeLabel(courseId: string) {
        return courses.find((course) => course.id === courseId)?.code ?? courseId;
    }

    function courseDisplayName(courseId: string) {
        const course = courses.find((item) => item.id === courseId);
        return course ? `${course.code} — ${course.name}` : courseId;
    }

    async function loadData() {
        try {
            const [submissionsRes, answersRes] = await Promise.all([
                fetch("/api/admin/submissions"),
                fetch("/api/admin/answers"),
            ]);

            if (submissionsRes.ok) {
                const data = await submissionsRes.json();
                setSubmissions(data.submissions ?? []);
            } else {
                setSubmissions([]);
                toast({
                    title: "Could not load submissions",
                    variant: "destructive",
                });
            }

            if (answersRes.ok) {
                const data = await answersRes.json();
                setAnswers(data.answers ?? []);
            } else {
                setAnswers([]);
                toast({
                    title: "Could not load answers",
                    variant: "destructive",
                });
            }
        } catch {
            setSubmissions([]);
            setAnswers([]);
            toast({
                title: "Could not load moderation data",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        void loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function endpointFor(kind: ItemKind, id: string) {
        return kind === "answer" ? `/api/admin/answers/${id}` : `/api/admin/submissions/${id}`;
    }

    async function handleApprove(kind: ItemKind, id: string) {
        setBusy(true);
        try {
            const res = await fetch(endpointFor(kind, id), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" }),
            });
            if (!res.ok) {
                toast({ title: "Failed to approve", variant: "destructive" });
                return;
            }
            toast({ title: kind === "answer" ? "Answer approved" : "Submission approved" });
            setViewItem(null);
            await loadData();
        } catch {
            toast({ title: "Failed to approve", variant: "destructive" });
        } finally {
            setBusy(false);
        }
    }

    async function confirmAction() {
        if (!pendingAction) return;
        setBusy(true);
        try {
            if (pendingAction.type === "reject") {
                const res = await fetch(endpointFor(pendingAction.kind, pendingAction.id), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "rejected",
                        rejectionReason: rejectionReason.trim() || undefined,
                    }),
                });
                if (!res.ok) {
                    toast({ title: "Failed to reject", variant: "destructive" });
                    return;
                }
                toast({ title: pendingAction.kind === "answer" ? "Answer rejected" : "Submission rejected" });
            } else {
                const res = await fetch(endpointFor(pendingAction.kind, pendingAction.id), {
                    method: "DELETE",
                });
                if (!res.ok) {
                    toast({ title: "Failed to delete", variant: "destructive" });
                    return;
                }
                toast({ title: pendingAction.kind === "answer" ? "Answer deleted" : "Submission deleted" });
            }
            setViewItem(null);
            await loadData();
        } catch {
            toast({
                title: pendingAction.type === "delete" ? "Failed to delete" : "Failed to reject",
                variant: "destructive",
            });
        } finally {
            setBusy(false);
            setPendingAction(null);
            setRejectionReason("");
        }
    }

    const filteredSubmissions =
        submissions?.filter((item) => statusFilter === "all" || item.status === statusFilter) ?? [];
    const filteredAnswers =
        answers?.filter((item) => statusFilter === "all" || item.status === statusFilter) ?? [];

    const loading = submissions === null || answers === null;
    const viewingSubmission = viewItem && "title" in viewItem ? viewItem : null;
    const viewingAnswer = viewItem && !("title" in viewItem) ? viewItem : null;
    const questionById = new Map((submissions ?? []).map((item) => [item.id, item]));
    const viewingAnswerQuestion = viewingAnswer
        ? questionById.get(viewingAnswer.questionId)
        : undefined;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">Course Submissions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Review and moderate student advice, questions, and answers.
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                    <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                    >
                        {status}
                    </Button>
                ))}
            </div>

            <Tabs defaultValue="submissions">
                <TabsList>
                    <TabsTrigger value="submissions">
                        Submissions ({loading ? "—" : filteredSubmissions.length})
                    </TabsTrigger>
                    <TabsTrigger value="answers">
                        Answers ({loading ? "—" : filteredAnswers.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="submissions" className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner className="size-6" />
                        </div>
                    ) : filteredSubmissions.length === 0 ? (
                        <Empty className="border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <CheckCircle2 />
                                </EmptyMedia>
                                <EmptyTitle>No submissions</EmptyTitle>
                                <EmptyDescription>
                                    {statusFilter === "all"
                                        ? "No submissions to review."
                                        : `No ${statusFilter} submissions to review.`}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        filteredSubmissions.map((submission) => (
                            <Card key={submission.id}>
                                <CardContent className="space-y-4 pt-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">{submission.type}</Badge>
                                        <Badge variant="outline">{submission.courseId}</Badge>
                                        <Badge variant={statusVariant(submission.status)}>
                                            {submission.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{submission.title}</h3>
                                        <p className="my-2 line-clamp-2 text-sm text-muted-foreground">
                                            {submission.content}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            By {submission.author} • {formatDate(submission.createdAt)}
                                        </p>
                                    </div>
                                    {submission.rejectionReason && (
                                        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                            Rejection reason: {submission.rejectionReason}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewItem(submission)}
                                        >
                                            <Eye />
                                            View
                                        </Button>
                                        {submission.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    disabled={busy}
                                                    onClick={() => handleApprove("submission", submission.id)}
                                                >
                                                    <CheckCircle2 />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        setPendingAction({
                                                            type: "reject",
                                                            kind: "submission",
                                                            id: submission.id,
                                                        })
                                                    }
                                                >
                                                    <XCircle />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={busy}
                                            onClick={() =>
                                                setPendingAction({
                                                    type: "delete",
                                                    kind: "submission",
                                                    id: submission.id,
                                                    isQuestion: submission.type === "question",
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="answers" className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner className="size-6" />
                        </div>
                    ) : filteredAnswers.length === 0 ? (
                        <Empty className="border">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <CheckCircle2 />
                                </EmptyMedia>
                                <EmptyTitle>No answers</EmptyTitle>
                                <EmptyDescription>
                                    {statusFilter === "all"
                                        ? "No answers to review."
                                        : `No ${statusFilter} answers to review.`}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        filteredAnswers.map((answer) => {
                            const question = questionById.get(answer.questionId);
                            return (
                                <Card key={answer.id}>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">Answer</Badge>
                                            <Badge variant="outline">
                                                {question ? courseBadgeLabel(question.courseId) : "Unknown course"}
                                            </Badge>
                                            <Badge variant={statusVariant(answer.status)}>{answer.status}</Badge>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Question: {question?.title ?? "Unknown question"}
                                            </p>
                                            <p className="my-2 line-clamp-2 text-sm text-muted-foreground">
                                                {answer.content}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                By {answer.author} • {formatDate(answer.createdAt)}
                                            </p>
                                        </div>
                                        {answer.rejectionReason && (
                                            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                                Rejection reason: {answer.rejectionReason}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => setViewItem(answer)}>
                                                <Eye />
                                                View
                                            </Button>
                                            {answer.status === "pending" && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        disabled={busy}
                                                        onClick={() => handleApprove("answer", answer.id)}
                                                    >
                                                        <CheckCircle2 />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            setPendingAction({
                                                                type: "reject",
                                                                kind: "answer",
                                                                id: answer.id,
                                                            })
                                                        }
                                                    >
                                                        <XCircle />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={busy}
                                                onClick={() =>
                                                    setPendingAction({
                                                        type: "delete",
                                                        kind: "answer",
                                                        id: answer.id,
                                                    })
                                                }
                                            >
                                                <Trash2 />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={viewItem !== null} onOpenChange={(open) => !open && setViewItem(null)}>
                <DialogContent className="max-w-lg">
                    {viewingSubmission && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{viewingSubmission.title}</DialogTitle>
                                <DialogDescription>
                                    {viewingSubmission.courseId} • {viewingSubmission.type} • By{" "}
                                    {viewingSubmission.author}
                                </DialogDescription>
                            </DialogHeader>
                            <p className="whitespace-pre-wrap">{viewingSubmission.content}</p>
                            {viewingSubmission.rejectionReason && (
                                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    Rejection reason: {viewingSubmission.rejectionReason}
                                </p>
                            )}
                        </>
                    )}
                    {viewingAnswer && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Answer</DialogTitle>
                                <DialogDescription>
                                    {viewingAnswerQuestion
                                        ? `${courseDisplayName(viewingAnswerQuestion.courseId)} • By ${viewingAnswer.author}`
                                        : `By ${viewingAnswer.author}`}
                                    {" • "}
                                    {formatDate(viewingAnswer.createdAt)}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                <div className="rounded-md bg-muted p-3">
                                    <p className="text-xs font-medium text-muted-foreground">Question</p>
                                    <p className="font-medium">
                                        {viewingAnswerQuestion?.title ?? "Unknown question"}
                                    </p>
                                    {viewingAnswerQuestion?.content && (
                                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                            {viewingAnswerQuestion.content}
                                        </p>
                                    )}
                                </div>
                                <p className="whitespace-pre-wrap">{viewingAnswer.content}</p>
                            </div>
                            {viewingAnswer.rejectionReason && (
                                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    Rejection reason: {viewingAnswer.rejectionReason}
                                </p>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog
                open={pendingAction !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingAction(null);
                        setRejectionReason("");
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.type === "reject" &&
                                (pendingAction.kind === "answer" ? "Reject answer" : "Reject submission")}
                            {pendingAction?.type === "delete" &&
                                (pendingAction.kind === "answer" ? "Delete answer" : "Delete submission")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.type === "reject" &&
                                "Provide an optional reason. The author will not see this on the public course page."}
                            {pendingAction?.type === "delete" &&
                                pendingAction.isQuestion &&
                                "This cannot be undone. All answers on this question will also be deleted."}
                            {pendingAction?.type === "delete" &&
                                !pendingAction.isQuestion &&
                                "This cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {pendingAction?.type === "reject" && (
                        <Textarea
                            placeholder="Reason for rejection (optional)"
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            rows={4}
                        />
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={busy}
                            onClick={confirmAction}
                            className={
                                pendingAction?.type === "delete"
                                    ? "bg-destructive text-white hover:bg-destructive/90"
                                    : undefined
                            }
                        >
                            {busy ? <Spinner className="size-4" /> : pendingAction?.type === "delete" ? "Delete" : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
