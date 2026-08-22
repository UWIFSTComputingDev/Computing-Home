import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm"
import Link from "next/link"
import {
    ShieldAlert,
    ShieldCheck,
    UserCog,
    UserPlus,
    Users,
} from "lucide-react"

import { db } from "@/db"
import { profiles, users } from "@/db/schema"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
            <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Overview of the department admin console.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="transition-colors hover:bg-muted/50">
                            <CardHeader>
                                <stat.icon className="size-5 text-muted-foreground" />
                                <CardDescription>{stat.label}</CardDescription>
                                <CardTitle className="text-3xl">{stat.value}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Recent signups</h2>
                {metrics.recentSignups.length === 0 ? (
                    <Empty className="border">
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
                    <div className="rounded-md border overflow-x-auto">
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
                )}
            </div>
        </div>
    )
}
