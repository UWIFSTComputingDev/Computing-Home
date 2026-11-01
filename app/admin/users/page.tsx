"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Search, ShieldCheck, ShieldOff, Trash2, Users } from "lucide-react"

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AdminPageHeader } from "@/components/admin/admin-page-header"

interface AdminUserRow {
    id: string
    email: string
    role: "user" | "admin"
    banned: boolean
    bannedReason: string | null
    bannedAt: string | null
    createdAt: string
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
    position: string | null
}

type PendingAction =
    | { type: "role"; user: AdminUserRow; nextRole: "user" | "admin" }
    | { type: "ban"; user: AdminUserRow }
    | { type: "unban"; user: AdminUserRow }
    | { type: "delete"; user: AdminUserRow }

export default function AdminUsersPage() {
    const { toast } = useToast()
    const [users, setUsers] = useState<AdminUserRow[] | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
    const [banReason, setBanReason] = useState("")
    const [busy, setBusy] = useState(false)

    async function loadUsers() {
        const res = await fetch("/api/admin/users")
        if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
        }
    }

    useEffect(() => {
        loadUsers()
        fetch("/api/auth/me")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => setCurrentUserId(data?.user?.id ?? null))
    }, [])

    async function updateUser(id: string, body: Record<string, unknown>) {
        const res = await fetch(`/api/admin/users/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            toast({ title: "Action failed", description: data.error ?? "Something went wrong.", variant: "destructive" })
            return false
        }
        setUsers((prev) => prev?.map((u) => (u.id === id ? { ...u, ...data.user } : u)) ?? null)
        return true
    }

    async function confirmAction() {
        if (!pendingAction) return
        setBusy(true)
        try {
            if (pendingAction.type === "role") {
                const ok = await updateUser(pendingAction.user.id, { role: pendingAction.nextRole })
                if (ok) {
                    toast({ title: `${pendingAction.user.displayName ?? pendingAction.user.email} is now ${pendingAction.nextRole}` })
                }
            } else if (pendingAction.type === "ban") {
                const ok = await updateUser(pendingAction.user.id, { banned: true, bannedReason: banReason || null })
                if (ok) toast({ title: `${pendingAction.user.displayName ?? pendingAction.user.email} has been banned.` })
            } else if (pendingAction.type === "unban") {
                const ok = await updateUser(pendingAction.user.id, { banned: false })
                if (ok) toast({ title: `${pendingAction.user.displayName ?? pendingAction.user.email} has been unbanned.` })
            } else if (pendingAction.type === "delete") {
                const res = await fetch(`/api/admin/users/${pendingAction.user.id}`, { method: "DELETE" })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    toast({ title: "Removal failed", description: data.error ?? "Something went wrong.", variant: "destructive" })
                } else {
                    setUsers((prev) => prev?.filter((u) => u.id !== pendingAction.user.id) ?? null)
                    toast({ title: `${pendingAction.user.displayName ?? pendingAction.user.email} has been removed.` })
                }
            }
        } finally {
            setBusy(false)
            setPendingAction(null)
            setBanReason("")
        }
    }

    const filtered = users?.filter((u) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return u.email.toLowerCase().includes(q) || (u.displayName ?? "").toLowerCase().includes(q)
    })

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                section="People"
                title="Users"
                description="Find accounts, review access, and manage roles and account status."
                icon={Users}
            />

            {users === null ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : users.length === 0 ? (
                <Empty className="border">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Users />
                        </EmptyMedia>
                        <EmptyTitle>No users yet</EmptyTitle>
                        <EmptyDescription>
                            There are no accounts to manage yet.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div>
                            <h2 className="font-semibold">Portal accounts</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{filtered?.length ?? 0} matching {filtered?.length === 1 ? "account" : "accounts"}</p>
                        </div>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                aria-label="Search users by name or email"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <div className="space-y-3 p-3 md:hidden">
                        {filtered?.map((user) => (
                            <article key={user.id} className="rounded-xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{user.displayName ?? "Unnamed user"}</p>
                                        <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <UserActionsMenu user={user} currentUserId={currentUserId} onAction={setPendingAction} />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                                    <Badge variant={user.banned ? "destructive" : "secondary"}>{user.banned ? "Banned" : "Active"}</Badge>
                                    {user.position && <Badge variant="outline">{user.position}</Badge>}
                                </div>
                            </article>
                        ))}
                        {filtered?.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No users match this search.</p>}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.displayName ?? "—"}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.banned ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : (
                                                <Badge variant="secondary">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.position ?? "—"}</TableCell>
                                        <TableCell className="text-right">
                                            <UserActionsMenu user={user} currentUserId={currentUserId} onAction={setPendingAction} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </section>
            )}

            <AlertDialog open={pendingAction !== null} onOpenChange={(open) => !open && setPendingAction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.type === "role" &&
                                `${pendingAction.nextRole === "admin" ? "Promote" : "Demote"} user`}
                            {pendingAction?.type === "ban" && "Ban user"}
                            {pendingAction?.type === "unban" && "Unban user"}
                            {pendingAction?.type === "delete" && "Remove user"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.type === "role" &&
                                `${pendingAction.user.displayName ?? pendingAction.user.email} will ${pendingAction.nextRole === "admin" ? "be given" : "lose"} administrator access.`}
                            {pendingAction?.type === "ban" &&
                                `This will immediately sign out ${pendingAction.user.displayName ?? pendingAction.user.email} and block them from logging in.`}
                            {pendingAction?.type === "unban" &&
                                `${pendingAction.user.displayName ?? pendingAction.user.email} will regain access to their account.`}
                            {pendingAction?.type === "delete" &&
                                `This permanently deletes ${pendingAction.user.displayName ?? pendingAction.user.email}'s account and profile. This cannot be undone.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {pendingAction?.type === "ban" && (
                        <Textarea
                            placeholder="Reason for ban (optional)"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                        />
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={busy} onClick={confirmAction}>
                            {busy ? <Spinner className="size-4" /> : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function UserActionsMenu({
    user,
    currentUserId,
    onAction,
}: {
    user: AdminUserRow
    currentUserId: string | null
    onAction: (action: PendingAction) => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${user.displayName ?? user.email}`}>
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    disabled={user.id === currentUserId}
                    onClick={() => onAction({
                        type: "role",
                        user,
                        nextRole: user.role === "admin" ? "user" : "admin",
                    })}
                >
                    <ShieldCheck className="mr-2 size-4" />
                    {user.role === "admin" ? "Demote to user" : "Promote to admin"}
                </DropdownMenuItem>
                {user.banned ? (
                    <DropdownMenuItem onClick={() => onAction({ type: "unban", user })}>
                        <ShieldCheck className="mr-2 size-4" />
                        Unban user
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        disabled={user.id === currentUserId}
                        variant="destructive"
                        onClick={() => onAction({ type: "ban", user })}
                    >
                        <ShieldOff className="mr-2 size-4" />
                        Ban user
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    disabled={user.id === currentUserId}
                    variant="destructive"
                    onClick={() => onAction({ type: "delete", user })}
                >
                    <Trash2 className="mr-2 size-4" />
                    Remove user
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
