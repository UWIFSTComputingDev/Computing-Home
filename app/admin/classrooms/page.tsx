"use client";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Classroom } from "@/lib/types";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";


export default function ClassroomsPage() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (<div className="flex flex-col">
        <div className="flex justify-between bg-background dark:bg-background/20 py-8 px-4">
            <h2 className="text-lg font-bold">Classrooms</h2>
            <AddClassroom setClassrooms={setClassrooms} />
        </div>

        <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
            <table className="w-full text-sm text-left rtl:text-right text-body">
                <thead className="text-sm text-body bg-neutral-secondary-soft border-b rounded-base border-default">
                    <tr>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Title
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Name on Timetable
                        </th>
                        <th scope="col" className="px-6 py-3 font-medium">
                            Description/Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="mx-auto size-5 animate-spin" aria-label="Loading classrooms" /></td></tr> : classrooms.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No classrooms found.</td></tr> : classrooms.map(classroom => <tr key={classroom.code} className="bg-neutral-primary border-b border-default">
                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                            {classroom.title}
                        </th>
                        <td className="px-6 py-4">
                            {classroom.code}
                        </td>
                        <td className="px-6 py-4">
                            {classroom.directions}
                        </td>
                        <td className="px-6 py-4"><div className="flex justify-end gap-2"><EditClassroom classroom={classroom} setClassrooms={setClassrooms} /><DeleteClassroom classroom={classroom} setClassrooms={setClassrooms} /></div></td>
                    </tr>)}
                </tbody>
            </table>
        </div>
    </div>);
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