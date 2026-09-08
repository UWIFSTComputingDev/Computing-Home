"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, ShieldCheck, ShieldOff, Trash2, Users } from "lucide-react"

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
            <div>
                <h1 className="text-2xl font-semibold">Users</h1>
                <p className="text-sm text-muted-foreground">
                    Manage accounts and permissions for the department portal.
                </p>
            </div>

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
                            Once user management is wired up, accounts will be listed here.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <div className="rounded-md border overflow-x-auto">
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" aria-label="User actions">
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        disabled={user.id === currentUserId}
                                                        onClick={() =>
                                                            setPendingAction({
                                                                type: "role",
                                                                user,
                                                                nextRole: user.role === "admin" ? "user" : "admin",
                                                            })
                                                        }
                                                    >
                                                        <ShieldCheck className="mr-2 size-4" />
                                                        {user.role === "admin" ? "Demote to user" : "Promote to admin"}
                                                    </DropdownMenuItem>
                                                    {user.banned ? (
                                                        <DropdownMenuItem onClick={() => setPendingAction({ type: "unban", user })}>
                                                            <ShieldCheck className="mr-2 size-4" />
                                                            Unban user
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            disabled={user.id === currentUserId}
                                                            variant="destructive"
                                                            onClick={() => setPendingAction({ type: "ban", user })}
                                                        >
                                                            <ShieldOff className="mr-2 size-4" />
                                                            Ban user
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        disabled={user.id === currentUserId}
                                                        variant="destructive"
                                                        onClick={() => setPendingAction({ type: "delete", user })}
                                                    >
                                                        <Trash2 className="mr-2 size-4" />
                                                        Remove user
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
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
