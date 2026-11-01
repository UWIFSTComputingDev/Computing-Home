import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm"
import Link from "next/link"
import {
    ShieldAlert,
    ShieldCheck,
    UserCog,
    UserPlus,
    Users,
    LayoutDashboard,
} from "lucide-react"

import { db } from "@/db"
import { profiles, users } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty"

async function getDashboardMetrics() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
        [{ count: totalUsers }],
        [{ count: adminCount }],
        [{ count: bannedCount }],
        [{ count: committeeCount }],
        [{ count: newUsersCount }],
        recentSignups,
    ] = await Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(users),
        db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "admin")),
        db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.banned, true)),
        db.select({ count: sql<number>`count(*)::int` }).from(profiles).where(isNotNull(profiles.position)),
        db
            .select({ count: sql<number>`count(*)::int` })
            .from(users)
            .where(gte(users.createdAt, sevenDaysAgo)),
        db
            .select({
                id: users.id,
                email: users.email,
                role: users.role,
                banned: users.banned,
                createdAt: users.createdAt,
                displayName: profiles.displayName,
            })
            .from(users)
            .leftJoin(profiles, eq(profiles.userId, users.id))
            .orderBy(desc(users.createdAt))
            .limit(5),
    ])

    return {
        totalUsers,
        adminCount,
        bannedCount,
        committeeCount,
        newUsersCount,
        recentSignups,
    }
}

export default async function AdminDashboardPage() {
    const metrics = await getDashboardMetrics()

    const stats = [
        {
            label: "Total users",
            value: metrics.totalUsers,
            icon: Users,
            href: "/admin/users",
        },
        {
            label: "Admins",
            value: metrics.adminCount,
            icon: ShieldCheck,
            href: "/admin/users",
        },
        {
            label: "Banned users",
            value: metrics.bannedCount,
            icon: ShieldAlert,
            href: "/admin/users",
        },
        {
            label: "Committee members",
            value: metrics.committeeCount,
            icon: UserCog,
            href: "/admin/committee-members",
        },
        {
            label: "New users (7d)",
            value: metrics.newUsersCount,
            icon: UserPlus,
            href: "/admin/users",
        },
    ]

    return (
        <div className="flex flex-col gap-6">
            <AdminPageHeader
                section="Overview"
                title="Dashboard"
                description="A quick view of portal activity and the tools you manage."
                icon={LayoutDashboard}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href} className="group">
                        <Card className="h-full border-border/70 bg-card shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-md">
                            <CardContent className="flex items-start justify-between gap-3 p-5">
                                <div>
                                    <CardDescription>{stat.label}</CardDescription>
                                    <CardTitle className="mt-3 text-3xl tabular-nums">{stat.value}</CardTitle>
                                    <p className="mt-2 text-xs font-medium text-primary">View details <span aria-hidden="true">→</span></p>
                                </div>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <stat.icon className="size-5" />
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="flex flex-col gap-1 border-b border-border/70 px-5 py-4 sm:px-6">
                    <h2 className="text-base font-semibold">Recent signups</h2>
                    <p className="text-sm text-muted-foreground">The latest accounts created on the portal.</p>
                </div>
                {metrics.recentSignups.length === 0 ? (
                    <Empty className="border-0">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <UserPlus />
                            </EmptyMedia>
                            <EmptyTitle>No signups yet</EmptyTitle>
                            <EmptyDescription>
                                New accounts will show up here as people register.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                    <div className="space-y-3 p-3 md:hidden">
                        {metrics.recentSignups.map((signup) => (
                            <article key={signup.id} className="rounded-xl border border-border/70 bg-background p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold">{signup.displayName ?? "Unnamed user"}</p>
                                        <p className="mt-1 break-all text-sm text-muted-foreground">{signup.email}</p>
                                    </div>
                                    <Badge variant={signup.role === "admin" ? "default" : "outline"}>{signup.role}</Badge>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    {signup.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="secondary">Active</Badge>}
                                    <span className="text-xs text-muted-foreground">{new Date(signup.createdAt).toLocaleDateString()}</span>
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
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics.recentSignups.map((signup) => (
                                    <TableRow key={signup.id}>
                                        <TableCell className="font-medium">{signup.displayName ?? "—"}</TableCell>
                                        <TableCell className="text-muted-foreground">{signup.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={signup.role === "admin" ? "default" : "outline"}>
                                                {signup.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {signup.banned ? (
                                                <Badge variant="destructive">Banned</Badge>
                                            ) : (
                                                <Badge variant="secondary">Active</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(signup.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    </>
                )}
            </section>
        </div>
    )
}
