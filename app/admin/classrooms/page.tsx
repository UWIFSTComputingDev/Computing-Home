"use client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Classroom } from "@/lib/types";
import { Building2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";


export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchClassrooms = async () => {
            const res = await fetch("/api/classrooms");

            if (res.ok) {
                setClassrooms(await res.json());
            }
            setIsLoading(false);
        }

        fetchClassrooms();
    }, []);

    const visibleClassrooms = classrooms.filter((room) => {
        const query = search.trim().toLowerCase();
        return !query || [room.code, room.title, room.directions].some((value) => value.toLowerCase().includes(query));
    });

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                section="Places"
                title="Classrooms"
                description="Keep timetable names, room titles, and location guidance up to date."
                icon={Building2}
                action={<AddClassroom setClassrooms={setClassrooms} />}
            />
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div>
                        <h2 className="font-semibold">Room directory</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{visibleClassrooms.length} of {classrooms.length} rooms</p>
                    </div>
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input aria-label="Search classrooms" placeholder="Search rooms..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
                    </div>
                </div>
                {isLoading ? (
                    <div className="flex justify-center py-14"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading classrooms" /></div>
                ) : classrooms.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm text-muted-foreground">No classrooms found. Add the first room to the directory.</p>
                ) : visibleClassrooms.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm text-muted-foreground">No classrooms match your search.</p>
                ) : (
                    <>
                        <div className="space-y-3 p-3 md:hidden">
                            {visibleClassrooms.map((classroom) => (
                                <article key={classroom.code} className="rounded-xl border border-border/70 bg-background p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold">{classroom.title}</h3>
                                            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">{classroom.code}</p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <EditClassroom classroom={classroom} setClassrooms={setClassrooms} />
                                            <DeleteClassroom classroom={classroom} setClassrooms={setClassrooms} />
                                        </div>
                                    </div>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{classroom.directions}</p>
                                </article>
                            ))}
                        </div>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b bg-muted/40 text-muted-foreground"><tr>
                                    <th className="px-5 py-3 font-medium">Room</th>
                                    <th className="px-5 py-3 font-medium">Timetable name</th>
                                    <th className="px-5 py-3 font-medium">Location details</th>
                                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                                </tr></thead>
                                <tbody>
                                    {visibleClassrooms.map((classroom) => (
                                        <tr key={classroom.code} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-5 py-4 font-semibold">{classroom.title}</td>
                                            <td className="px-5 py-4 text-muted-foreground">{classroom.code}</td>
                                            <td className="max-w-md px-5 py-4 text-muted-foreground">{classroom.directions}</td>
                                            <td className="px-5 py-4"><div className="flex justify-end gap-2"><EditClassroom classroom={classroom} setClassrooms={setClassrooms} /><DeleteClassroom classroom={classroom} setClassrooms={setClassrooms} /></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

const ClassroomForm = ({ classroom, setClassrooms, onClose }: { classroom?: Classroom; setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>; onClose: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const [code, setCode] = useState(classroom?.code ?? "");
    const [title, setTitle] = useState(classroom?.title ?? "");
    const [directions, setDirections] = useState(classroom?.directions ?? "");

    const saveClassroom = async () => {
        if (isSending)
            return;

        setIsSending(true);
        try {
            const res = await fetch("/api/classrooms", { method: classroom ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ originalCode: classroom?.code, code: code.trim(), title: title.trim(), directions: directions.trim() }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Unable to save classroom.");
            setClassrooms(prev => classroom ? prev.map(item => item.code === classroom.code ? data.classroom : item) : [...prev, data.classroom]);
            setIsOpen(false);
            onClose();
        } catch (error) {
            toast({ title: classroom ? "Unable to update classroom" : "Unable to add classroom", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
        } finally {
            setIsSending(false);
        }
    };

    return <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant={classroom ? "outline" : "secondary"} size={classroom ? "icon" : "default"} aria-label={classroom ? "Edit classroom" : undefined}>{classroom ? <Pencil className="size-4" /> : <><Plus className="size-4" />Add</>}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{classroom ? "Edit classroom" : "Add classroom"}</DialogTitle>
                <DialogDescription>Enter the timetable name, title, and location details.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-2">
                <Input aria-label="Timetable name" placeholder="e.g. LFST_ST_SLT_3" value={code} onChange={e => setCode(e.currentTarget.value)} />
                <Input aria-label="Title" placeholder="Science Lecture Theater 3" value={title} onChange={e => setTitle(e.currentTarget.value)} />
                <Textarea aria-label="Description or location" className="max-h-48" placeholder="Description or location" value={directions} onChange={e => setDirections(e.currentTarget.value)} />
            </div>
            <DialogFooter>
                <div className="flex justify-between w-full">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="button" disabled={isSending || code.trim() === "" || title.trim() === "" || directions.trim() === ""} onClick={saveClassroom}>{isSending ? <Loader2 className="size-4 animate-spin" role="status" aria-label="Saving" /> : classroom ? "Save" : "Add"}</Button>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

const AddClassroom = ({ setClassrooms }: { setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>> }) => <ClassroomForm setClassrooms={setClassrooms} onClose={() => undefined} />;

const EditClassroom = ({ classroom, setClassrooms }: { classroom: Classroom; setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>> }) => <ClassroomForm classroom={classroom} setClassrooms={setClassrooms} onClose={() => undefined} />;

const DeleteClassroom = ({ classroom, setClassrooms }: { classroom: Classroom; setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>> }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const deleteClassroom = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch("/api/classrooms", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: classroom.code }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error ?? "Unable to delete classroom.");
            setClassrooms(prev => prev.filter(item => item.code !== classroom.code));
            setIsOpen(false);
        } catch (error) {
            toast({ title: "Unable to delete classroom", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    return <><Button variant="ghost" size="icon" aria-label={`Delete ${classroom.title}`} onClick={() => setIsOpen(true)}><Trash2 className="size-4 text-destructive" /></Button><AlertDialog open={isOpen} onOpenChange={setIsOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete classroom?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {classroom.title} ({classroom.code}).</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction disabled={isDeleting} onClick={(event) => { event.preventDefault(); void deleteClassroom(); }} className="bg-destructive text-white hover:bg-destructive/90">{isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>;
};