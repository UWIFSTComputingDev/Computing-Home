"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Plus, Search, UserCog, X } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

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
    const [usersLoading, setUsersLoading] = useState(true)
    const [assignOpen, setAssignOpen] = useState(false)
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [userSearch, setUserSearch] = useState("")
    const [assignmentStep, setAssignmentStep] = useState<1 | 2>(1)
    const [positionInput, setPositionInput] = useState("")
    const [search, setSearch] = useState("")
    const [busy, setBusy] = useState(false)

    async function loadMembers() {
        const res = await fetch("/api/admin/committee-members")
        if (res.ok) {
            const data = await res.json()
            setMembers(data.members)
        }
    }

    async function loadAllUsers() {
        setUsersLoading(true)
        try {
            const res = await fetch("/api/admin/users")
            if (!res.ok) throw new Error("Unable to load available users.")
            const data = await res.json()
            setAllUsers(data.users)
        } catch (error) {
            toast({
                title: "Could not load available users",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            })
        } finally {
            setUsersLoading(false)
        }
    }

    function clearAssignmentForm() {
        setSelectedUserIds([])
        setUserSearch("")
        setPositionInput("")
        setAssignmentStep(1)
    }

    useEffect(() => {
        loadMembers()
        loadAllUsers()
    }, [])

    const availableUsers = useMemo(
        () => allUsers.filter((u) => !u.position),
        [allUsers],
    )
    const matchingUsers = useMemo(() => {
        const query = userSearch.trim().toLowerCase()
        if (query.length < 2) return []
        return availableUsers
            .filter((user) => `${user.displayName ?? ""} ${user.email}`.toLowerCase().includes(query))
            .slice(0, 30)
    }, [availableUsers, userSearch])
    const matchingUserCount = useMemo(() => {
        const query = userSearch.trim().toLowerCase()
        if (query.length < 2) return 0
        return availableUsers.filter((user) => `${user.displayName ?? ""} ${user.email}`.toLowerCase().includes(query)).length
    }, [availableUsers, userSearch])
    const selectedUsers = selectedUserIds
        .map((id) => allUsers.find((user) => user.id === id))
        .filter((user): user is AdminUserOption => user !== undefined)
    const filteredMembers = members?.filter((member) => {
        const query = search.trim().toLowerCase()
        return !query || [member.displayName ?? "", member.email, member.position ?? ""]
            .some((value) => value.toLowerCase().includes(query))
    })

    async function assignPosition() {
        if (selectedUserIds.length === 0 || !positionInput.trim()) return
        setBusy(true)
        try {
            const results = await Promise.allSettled(selectedUserIds.map(async (userId) => {
                const res = await fetch(`/api/admin/users/${userId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ position: positionInput.trim() }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) throw new Error(data.error ?? "Unable to assign this position.")
                return userId
            }))
            const assignedIds = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : [])
            const failedIds = selectedUserIds.filter((_, index) => results[index]?.status === "rejected")
            const failedReasons = results.flatMap((result) =>
                result.status === "rejected"
                    ? [result.reason instanceof Error ? result.reason.message : "Request failed."]
                    : [],
            )

            if (assignedIds.length > 0) {
                const refreshResults = await Promise.allSettled([loadMembers(), loadAllUsers()])
                if (refreshResults.some((result) => result.status === "rejected")) {
                    toast({
                        title: "Roster refresh failed",
                        description: "The assignment was saved, but the roster could not be refreshed. Reload the page to see the latest changes.",
                        variant: "destructive",
                    })
                }
            }

            if (failedIds.length > 0) {
                toast({
                    title: assignedIds.length > 0
                        ? `Position assigned to ${assignedIds.length}; ${failedIds.length} failed`
                        : "Position assignment failed",
                    description: failedReasons[0],
                    variant: "destructive",
                })
                setSelectedUserIds(failedIds)
                setAssignmentStep(1)
            } else {
                toast({ title: `Position assigned to ${assignedIds.length} ${assignedIds.length === 1 ? "user" : "users"}.` })
                setAssignOpen(false)
                clearAssignmentForm()
            }
        } catch (error) {
            toast({
                title: "Could not refresh the committee roster",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            })
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
            <AdminPageHeader
                section="People"
                title="Committee members"
                description="Maintain the department roster and assign leadership positions."
                icon={UserCog}
                action={
                    <Dialog open={assignOpen} onOpenChange={(open) => {
                        if (busy) return
                        setAssignOpen(open)
                        if (!open) clearAssignmentForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="size-4" />
                                Assign position
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-xl">
                            <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
                                <DialogHeader className="space-y-1 text-left">
                                    <DialogTitle>Assign committee position</DialogTitle>
                                    <DialogDescription className="text-xs">Select people and a shared title.</DialogDescription>
                                </DialogHeader>
                                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                    Step {assignmentStep} of 2
                                </span>
                            </div>
                            {assignmentStep === 1 ? (
                                <>
                                    <div className="space-y-3 p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <label htmlFor="committee-user-search" className="text-sm font-semibold">Choose people</label>
                                            <span className="text-xs text-muted-foreground">{selectedUserIds.length} selected · {availableUsers.length} available</span>
                                        </div>
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                id="committee-user-search"
                                                type="search"
                                                placeholder="Search name or email..."
                                                value={userSearch}
                                                onChange={(event) => setUserSearch(event.target.value)}
                                                className="h-10 pl-9"
                                            />
                                        </div>
                                        <div
                                            id="committee-user-results"
                                            role="listbox"
                                            aria-label="Available users"
                                            aria-multiselectable="true"
                                            className="max-h-56 overflow-y-auto rounded-xl border border-border/80 bg-background p-1"
                                        >
                                            {usersLoading ? (
                                                <div className="flex items-center justify-center gap-2 px-3 py-5 text-sm text-muted-foreground"><Spinner className="size-4" />Loading users...</div>
                                            ) : availableUsers.length === 0 ? (
                                                <p className="px-3 py-5 text-center text-sm text-muted-foreground">No users available to assign.</p>
                                            ) : userSearch.trim().length < 2 ? (
                                                <p className="px-3 py-5 text-center text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
                                            ) : matchingUsers.length === 0 ? (
                                                <p className="px-3 py-5 text-center text-sm text-muted-foreground">No matches found.</p>
                                            ) : (
                                                <>
                                                    {matchingUsers.map((user) => {
                                                        const isSelected = selectedUserIds.includes(user.id)
                                                        return (
                                                            <button
                                                                key={user.id}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={isSelected}
                                                                onClick={() => setSelectedUserIds((current) =>
                                                                    isSelected ? current.filter((id) => id !== user.id) : [...current, user.id],
                                                                )}
                                                                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${isSelected ? "bg-primary/8" : "hover:bg-muted/70"}`}
                                                            >
                                                                <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"}`}>
                                                                    {isSelected && <Check className="size-3" />}
                                                                </span>
                                                                <span className="min-w-0 flex-1">
                                                                    <span className="block truncate text-sm font-medium">{user.displayName ?? "Unnamed user"}</span>
                                                                    <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                                                                </span>
                                                            </button>
                                                        )
                                                    })}
                                                    {matchingUserCount > matchingUsers.length && (
                                                        <p className="px-3 py-2 text-center text-xs text-muted-foreground">Showing 30 of {matchingUserCount}; refine your search.</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {selectedUsers.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedUsers.map((user) => (
                                                    <button
                                                        key={user.id}
                                                        type="button"
                                                        onClick={() => setSelectedUserIds((current) => current.filter((id) => id !== user.id))}
                                                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                                                        aria-label={`Remove ${user.displayName ?? user.email}`}
                                                    >
                                                        <span className="max-w-48 truncate">{user.displayName ?? user.email}</span>
                                                        <X className="size-3" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter className="border-t border-border/70 px-5 py-3">
                                        <Button
                                            type="button"
                                            disabled={selectedUserIds.length === 0}
                                            onClick={() => setAssignmentStep(2)}
                                        >
                                            Continue with {selectedUserIds.length}
                                        </Button>
                                    </DialogFooter>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4 p-5">
                                        <section className="rounded-xl border border-border/70 bg-muted/20 p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold">{selectedUserIds.length} selected</p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {selectedUsers.slice(0, 3).map((user) => user.displayName ?? user.email).join(", ")}
                                                        {selectedUsers.length > 3 ? ` and ${selectedUsers.length - 3} more` : ""}
                                                    </p>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setAssignmentStep(1)}>Change</Button>
                                            </div>
                                        </section>
                                        <section className="space-y-2.5">
                                            <div>
                                                <label htmlFor="committee-position" className="text-sm font-semibold">Position title</label>
                                                <p className="text-xs text-muted-foreground">This title will be assigned to everyone selected.</p>
                                            </div>
                                            <Input
                                                id="committee-position"
                                                placeholder="Enter a committee position..."
                                                value={positionInput}
                                                onChange={(event) => setPositionInput(event.target.value)}
                                                className="h-10"
                                            />
                                            <div className="flex flex-wrap gap-1.5">
                                                {["Computing Representative", "Deputy Computing Representative", "Secretary", "Treasurer", "Web Developer"].map((position) => (
                                                    <Button
                                                        key={position}
                                                        type="button"
                                                        size="sm"
                                                        variant={positionInput === position ? "secondary" : "outline"}
                                                        onClick={() => setPositionInput(position)}
                                                        className="h-8 px-2.5 text-xs"
                                                    >
                                                        {position}
                                                    </Button>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                    <DialogFooter className="flex-row justify-between border-t border-border/70 px-5 py-3">
                                        <Button type="button" variant="ghost" onClick={() => setAssignmentStep(1)} disabled={busy}>Back</Button>
                                        <Button
                                            type="button"
                                            disabled={busy || selectedUserIds.length === 0 || !positionInput.trim()}
                                            onClick={assignPosition}
                                        >
                                            {busy ? <Spinner className="size-4" /> : `Assign to ${selectedUserIds.length}`}
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                }
            />

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
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="font-semibold">Roster</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{filteredMembers?.length ?? 0} of {members.length} members</p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input aria-label="Search committee members" placeholder="Search roster..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
                        </div>
                    </div>
                    <div className="space-y-3 p-3 md:hidden">
                        {filteredMembers?.map((member) => (
                            <article key={member.id} className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{member.displayName ?? "Unnamed member"}</p>
                                        <p className="mt-1 break-all text-sm text-muted-foreground">{member.email}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label={`Remove position from ${member.displayName ?? member.email}`}
                                        disabled={busy}
                                        onClick={() => removePosition(member)}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Badge>{member.position}</Badge>
                                    <Badge variant={member.banned ? "destructive" : "secondary"}>{member.banned ? "Banned" : "Active"}</Badge>
                                </div>
                            </article>
                        ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
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
                                {filteredMembers?.map((member) => (
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
                    {filteredMembers?.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No members match this search.</p>}
                </section>
            )}
        </div>
    )
}
