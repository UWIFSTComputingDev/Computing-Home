"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, UserCog, X } from "lucide-react"

import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CommitteeMember {
    id: string
    email: string
    role: "user" | "admin"
    banned: boolean
    createdAt: string
    displayName: string | null
    avatarUrl: string | null
    position: string | null
}

interface AdminUserOption {
    id: string
    email: string
    displayName: string | null
    position: string | null
}

export default function AdminCommitteeMembersPage() {
    const { toast } = useToast()
    const [members, setMembers] = useState<CommitteeMember[] | null>(null)
    const [allUsers, setAllUsers] = useState<AdminUserOption[]>([])
    const [assignOpen, setAssignOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string>("")
    const [positionInput, setPositionInput] = useState("")
    const [busy, setBusy] = useState(false)

    async function loadMembers() {
        const res = await fetch("/api/admin/committee-members")
        if (res.ok) {
            const data = await res.json()
            setMembers(data.members)
        }
    }

    async function loadAllUsers() {
        const res = await fetch("/api/admin/users")
        if (res.ok) {
            const data = await res.json()
            setAllUsers(data.users)
        }
    }

    useEffect(() => {
        loadMembers()
        loadAllUsers()
    }, [])

    const availableUsers = useMemo(
        () => allUsers.filter((u) => !u.position),
        [allUsers],
    )

    async function assignPosition() {
        if (!selectedUserId || !positionInput.trim()) return
        setBusy(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUserId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: positionInput.trim() }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                toast({ title: "Assignment failed", description: data.error ?? "Something went wrong.", variant: "destructive" })
                return
            }
            toast({ title: "Position assigned." })
            setAssignOpen(false)
            setSelectedUserId("")
            setPositionInput("")
            loadMembers()
            loadAllUsers()
        } finally {
            setBusy(false)
        }
    }

    async function removePosition(member: CommitteeMember) {
        setBusy(true)
        try {
            const res = await fetch(`/api/admin/users/${member.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position: null }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                toast({ title: "Removal failed", description: data.error ?? "Something went wrong.", variant: "destructive" })
                return
            }
            toast({ title: `${member.displayName ?? member.email} removed from committee.` })
            setMembers((prev) => prev?.filter((m) => m.id !== member.id) ?? null)
            loadAllUsers()
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Committee Members</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the department committee roster.
                    </p>
                </div>
                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 size-4" />
                            Assign position
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Assign committee position</DialogTitle>
                            <DialogDescription>
                                Give any user an arbitrary committee position, such as &ldquo;President&rdquo; or &ldquo;Treasurer&rdquo;.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3">
                            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map((u) => (
                                        <SelectItem key={u.id} value={u.id}>
                                            {u.displayName ?? u.email} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                placeholder="Position (e.g. President)"
                                value={positionInput}
                                onChange={(e) => setPositionInput(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                disabled={busy || !selectedUserId || !positionInput.trim()}
                                onClick={assignPosition}
                            >
                                {busy ? <Spinner className="size-4" /> : "Assign"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {members === null ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : members.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <UserCog />
                        </EmptyMedia>
                        <EmptyTitle>No committee members yet</EmptyTitle>
                        <EmptyDescription>
                            Assign a position to a user to add them to the committee roster.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.displayName ?? "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                    <TableCell>
                                        <Badge>{member.position}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {member.banned ? (
                                            <Badge variant="destructive">Banned</Badge>
                                        ) : (
                                            <Badge variant="secondary">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Remove position"
                                            disabled={busy}
                                            onClick={() => removePosition(member)}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
