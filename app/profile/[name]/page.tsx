"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { AlertCircle, Search, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type PublicProfile = {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    position: string | null;
};

type SearchMatch = PublicProfile & { email: string };

type LookupResult =
    | { state: "profile"; profile: PublicProfile }
    | { state: "not-found" }
    | { state: "matches"; matches: SearchMatch[]; exact: boolean }
    | { state: "error"; message: string };

export default function PublicProfilePage() {
    const params = useParams<{ name: string }>();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const name = decodeURIComponent(params.name);

    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<LookupResult | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setResult(null);

            try {
                // ?id= takes priority over the [name] route param entirely.
                const query = id ? `id=${encodeURIComponent(id)}` : `name=${encodeURIComponent(name)}`;
                const response = await fetch(`/api/profile/lookup?${query}`);
                const payload = await response.json().catch(() => ({}));

                if (cancelled) return;

                if (id) {
                    if (!response.ok) {
                        setResult({ state: "not-found" });
                    } else {
                        setResult({ state: "profile", profile: payload.profile });
                    }
                    return;
                }

                if (!response.ok) {
                    setResult({ state: "error", message: payload.error || "Something went wrong." });
                    return;
                }

                const matches: SearchMatch[] = payload.matches ?? [];

                if (matches.length === 0) {
                    setResult({ state: "not-found" });
                } else if (matches.length === 1) {
                    setResult({ state: "profile", profile: matches[0] });
                } else {
                    setResult({ state: "matches", matches, exact: payload.exact });
                }
            } catch {
                if (!cancelled) {
                    setResult({ state: "error", message: "Failed to load this profile." });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [id, name]);

    return (
        <div className="flex min-h-screen flex-col">
            <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:py-10">
                {loading && (
                    <div className="flex justify-center py-12">
                        <Spinner className="size-6" />
                    </div>
                )}

                {!loading && result?.state === "error" && (
                    <Card>
                        <CardContent className="flex items-center gap-2 text-sm text-destructive">
                            <AlertCircle className="size-4" />
                            {result.message}
                        </CardContent>
                    </Card>
                )}

                {!loading && result?.state === "not-found" && (
                    <Empty className="border">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <UserRound />
                            </EmptyMedia>
                            <EmptyTitle>No profile found</EmptyTitle>
                            <EmptyDescription>
                                We couldn&apos;t find a profile matching &quot;{name}&quot;.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {!loading && result?.state === "profile" && <ProfileView profile={result.profile} />}

                {!loading && result?.state === "matches" && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">Multiple profiles found</h1>
                            <p className="text-sm text-muted-foreground">
                                {result.exact
                                    ? `Several people are named "${name}". Select the right one below.`
                                    : `We couldn't find an exact match for "${name}". Here are similar profiles.`}
                            </p>
                        </div>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Position</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.matches.map((match) => (
                                        <TableRow
                                            key={match.id}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                window.location.href = `/profile/${encodeURIComponent(match.displayName)}?id=${match.id}`;
                                            }}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={match.avatarUrl || undefined} alt={match.displayName} />
                                                        <AvatarFallback>
                                                            {match.displayName.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Link
                                                        href={`/profile/${encodeURIComponent(match.displayName)}?id=${match.id}`}
                                                        className="hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {match.displayName}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{match.email}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {match.position ? <Badge variant="secondary">{match.position}</Badge> : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function ProfileView({ profile }: { profile: PublicProfile }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
                <p className="text-sm text-muted-foreground">Public profile</p>
            </div>
            <Card>
                <CardContent className="flex flex-col items-center gap-4 text-center">
                    <Avatar className="size-20">
                        <AvatarImage src={profile.avatarUrl || undefined} alt={profile.displayName} />
                        <AvatarFallback className="text-xl">
                            {profile.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-lg font-semibold">{profile.displayName}</h2>
                        {profile.position && (
                            <Badge variant="secondary" className="mt-1">
                                {profile.position}
                            </Badge>
                        )}
                    </div>
                    {profile.bio && <p className="max-w-md text-sm text-muted-foreground">{profile.bio}</p>}
                    {!profile.bio && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Search className="size-3.5" /> No bio provided yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
