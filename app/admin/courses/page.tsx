"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Course, SemesterKey, YearKey } from "@/lib/types";

const emptyCourse: Course = { id: "", code: "", name: "", credits: 3, year: "y1", offered: ["s1"], degrees: [], prereqs: [], description: "" };
const semesters: { value: SemesterKey; label: string }[] = [
    { value: "s1", label: "Semester 1" },
    { value: "s2", label: "Semester 2" },
    { value: "s3", label: "Summer" },
];
const degrees = ["BSCS", "BSCY", "BITA", "BSSE"];

function normalizeCode(value: string) {
    return value.replace(/\s+/g, "").toUpperCase();
}

function normalizeDegree(value: string) {
    return value.replace(/\s+/g, "").toUpperCase();
}

export default function CoursesAdminPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/courses").then((response) => response.json()).then(setCourses).finally(() => setLoading(false));
    }, []);

    return <div className="flex flex-col">
        <div className="flex justify-between bg-background px-4 py-8">
            <h2 className="text-lg font-bold">Courses</h2>
            <CourseForm setCourses={setCourses} />
        </div>
        <div className="relative overflow-x-auto rounded-base border border-default bg-neutral-primary-soft shadow-xs">
            <table className="w-full text-left text-sm text-body">
                <thead className="border-b border-default bg-neutral-secondary-soft"><tr>
                    <th className="px-6 py-3 font-medium">Course</th><th className="px-6 py-3 font-medium">Level</th><th className="px-6 py-3 font-medium">Credits</th><th className="px-6 py-3 font-medium">Degrees</th><th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr></thead>
                <tbody>
                    {loading ? <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="mx-auto size-5 animate-spin" aria-label="Loading courses" /></td></tr> : courses.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No courses found.</td></tr> : courses.map((course) => <tr key={course.id} className="border-b border-default bg-neutral-primary">
                        <td className="px-6 py-4"><div className="font-medium">{course.code}</div><div className="text-muted-foreground">{course.name}</div></td>
                        <td className="px-6 py-4">Year {course.year.slice(1)}</td><td className="px-6 py-4">{course.credits}</td><td className="px-6 py-4">{course.degrees.join(", ")}</td>
                        <td className="px-6 py-4"><div className="flex justify-end gap-2"><CourseForm course={course} setCourses={setCourses} /><DeleteCourse course={course} setCourses={setCourses} /></div></td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    </div>;
}

function CourseForm({ course, setCourses }: { course?: Course; setCourses: React.Dispatch<React.SetStateAction<Course[]>> }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState<Course>(course ?? emptyCourse);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();
    const [otherDegree, setOtherDegree] = useState(() => (course?.degrees ?? []).find((degree) => !degrees.includes(degree)) ?? "");
    const [otherDegreeEnabled, setOtherDegreeEnabled] = useState(() => Boolean((course?.degrees ?? []).find((degree) => !degrees.includes(degree))));

    useEffect(() => {
        setForm(course ? { ...course, code: normalizeCode(course.code), id: normalizeCode(course.id), degrees: course.degrees.map(normalizeDegree) } : emptyCourse);
        setOtherDegree((course?.degrees ?? []).find((degree) => !degrees.includes(normalizeDegree(degree))) ?? "");
        setOtherDegreeEnabled(Boolean((course?.degrees ?? []).find((degree) => !degrees.includes(normalizeDegree(degree)))));
    }, [course, open]);

    async function save() {
        setSaving(true);
        try {
            const code = normalizeCode(form.code);
            const selectedDegrees = form.degrees.filter((degree) => degrees.includes(degree));
            const normalizedOtherDegree = otherDegreeEnabled ? normalizeDegree(otherDegree) : "";
            const response = await fetch("/api/courses", { method: course ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, originalId: course?.id, id: code, code, name: form.name.trim(), degrees: [...selectedDegrees, ...(normalizedOtherDegree ? [normalizedOtherDegree] : [])], prereqs: (form.prereqs ?? []).map(normalizeCode).filter(Boolean), description: form.description?.trim() || null }) });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error ?? "Unable to save course.");
            setCourses((current) => course ? current.map((item) => item.id === course.id ? data.course : item) : [...current, data.course]);
            window.dispatchEvent(new Event("courses-changed"));
            setOpen(false);
        } catch (error) { toast({ title: course ? "Unable to update course" : "Unable to add course", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }); } finally { setSaving(false); }
    }

    const update = (key: keyof Course, value: string | number | string[]) => setForm((current) => ({ ...current, [key]: value }));
    return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={course ? "outline" : "secondary"} size={course ? "icon" : "default"} aria-label={course ? "Edit course" : undefined}>{course ? <Pencil className="size-4" /> : <><Plus className="size-4" />Add</>}</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{course ? "Edit course" : "Add course"}</DialogTitle><DialogDescription>Maintain the course details used throughout the portal.</DialogDescription></DialogHeader>
            <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="course-code">Course code</Label>
                        <Input id="course-code" placeholder="e.g. COMP1126" value={form.code} onChange={(event) => { const code = normalizeCode(event.target.value); update("code", code); update("id", code); }} disabled={Boolean(course)} />
                        <p className="text-xs text-muted-foreground">The course code is also its ID and cannot be changed after creation.</p>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="course-name">Course name</Label>
                        <Input id="course-name" placeholder="Introduction to Computing I" value={form.name} onChange={(event) => update("name", event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="course-credits">Credits</Label>
                        <Input id="course-credits" type="number" min={1} max={30} value={form.credits} onChange={(event) => update("credits", Number(event.target.value))} />
                    </div>
                </div>

                <fieldset className="space-y-3 rounded-md border p-3">
                    <legend className="px-1 text-sm font-medium">Year</legend>
                    <RadioGroup value={form.year} onValueChange={(value) => update("year", value as YearKey)} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {["y1", "y2", "y3", "y4"].map((year) => <Label key={year} htmlFor={`course-${year}`} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal hover:bg-muted"><RadioGroupItem id={`course-${year}`} value={year} />Year {year.slice(1)}</Label>)}
                    </RadioGroup>
                </fieldset>

                <fieldset className="space-y-3 rounded-md border p-3">
                    <legend className="px-1 text-sm font-medium">Semesters offered</legend>
                    <div className="grid gap-2 sm:grid-cols-3">
                        {semesters.map((semester) => <Label key={semester.value} htmlFor={`course-${semester.value}`} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal hover:bg-muted"><Checkbox id={`course-${semester.value}`} checked={form.offered.includes(semester.value)} onCheckedChange={(checked) => update("offered", checked ? [...form.offered, semester.value] : form.offered.filter((item) => item !== semester.value))} />{semester.label}</Label>)}
                    </div>
                </fieldset>

                <fieldset className="space-y-3 rounded-md border p-3">
                    <legend className="px-1 text-sm font-medium">Degrees</legend>
                    <div className="grid grid-cols-2 gap-2">
                        {degrees.map((degree) => <Label key={degree} htmlFor={`course-degree-${degree}`} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal uppercase hover:bg-muted"><Checkbox id={`course-degree-${degree}`} checked={form.degrees.includes(degree)} onCheckedChange={(checked) => update("degrees", checked ? [...form.degrees, degree] : form.degrees.filter((item) => item !== degree))} />{degree}</Label>)}
                        <Label htmlFor="course-degree-other" className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 font-normal hover:bg-muted"><Checkbox id="course-degree-other" checked={otherDegreeEnabled} onCheckedChange={(checked) => { setOtherDegreeEnabled(Boolean(checked)); if (!checked) setOtherDegree(""); }} />Other</Label>
                    </div>
                    {otherDegreeEnabled ? <Input id="course-degree-other-value" className="mt-2 uppercase" placeholder="Other degree code" value={otherDegree} onChange={(event) => setOtherDegree(normalizeDegree(event.target.value))} /> : null}
                </fieldset>

                <div className="space-y-2">
                    <Label htmlFor="course-prereqs">Prerequisites</Label>
                    <Input id="course-prereqs" className="uppercase" placeholder="Course codes separated by commas" value={(form.prereqs ?? []).join(", ")} onChange={(event) => update("prereqs", event.target.value.split(",").map(normalizeCode).filter(Boolean))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="course-description">Description</Label>
                    <Textarea id="course-description" placeholder="Describe what students will learn." value={form.description ?? ""} onChange={(event) => update("description", event.target.value)} />
                </div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" disabled={saving || !form.code.trim() || !form.name.trim() || !form.degrees.some((degree) => degrees.includes(degree)) && !otherDegreeEnabled || otherDegreeEnabled && !otherDegree.trim()} onClick={save}>{saving ? <Loader2 className="size-4 animate-spin" aria-label="Saving" /> : "Save"}</Button></DialogFooter>
        </DialogContent></Dialog>;
}

function DeleteCourse({ course, setCourses }: { course: Course; setCourses: React.Dispatch<React.SetStateAction<Course[]>> }) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { toast } = useToast();
    async function remove() {
        setDeleting(true);
        try { const response = await fetch("/api/courses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: course.id }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error ?? "Unable to remove course."); setCourses((current) => current.filter((item) => item.id !== course.id)); window.dispatchEvent(new Event("courses-changed")); setOpen(false); } catch (error) { toast({ title: "Unable to remove course", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" }); } finally { setDeleting(false); }
    }
    return <><Button variant="ghost" size="icon" aria-label={`Delete ${course.code}`} onClick={() => setOpen(true)}><Trash2 className="size-4 text-destructive" /></Button><AlertDialog open={open} onOpenChange={setOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete course?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {course.code} ({course.name}).</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); void remove(); }} className="bg-destructive text-white hover:bg-destructive/90">{deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
}