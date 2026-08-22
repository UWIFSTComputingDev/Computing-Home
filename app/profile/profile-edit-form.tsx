"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = {
    displayName: string;
    bio: string;
    avatarUrl: string;
};

type InitialProfile = {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    position: string | null;
} | null;

export function ProfileEditForm({ initialProfile }: { initialProfile: InitialProfile }) {
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        defaultValues: {
            displayName: initialProfile?.displayName ?? "",
            bio: initialProfile?.bio ?? "",
            avatarUrl: initialProfile?.avatarUrl ?? "",
        },
    });

    const avatarUrl = watch("avatarUrl");
    const displayName = watch("displayName");

    async function onSubmit(values: ProfileFormValues) {
        setStatus(null);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: values.displayName,
                    bio: values.bio || null,
                    avatarUrl: values.avatarUrl || null,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Failed to save your profile.");
            }

            setStatus({ type: "success", message: "Your profile has been updated." });
        } catch (error) {
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Something went wrong.",
            });
        }
    }

    if (!initialProfile) {
        return (
            <Card>
                <CardContent className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="size-4" />
                    We couldn&apos;t find a profile for your account.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16">
                            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                            <AvatarFallback className="text-lg">
                                {displayName?.trim()?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        {initialProfile.position && <Badge variant="secondary">{initialProfile.position}</Badge>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="displayName">Name</Label>
                        <Input
                            id="displayName"
                            placeholder="Jane Doe"
                            aria-invalid={!!errors.displayName}
                            {...register("displayName", { required: "Name is required." })}
                        />
                        {errors.displayName && (
                            <p className="text-sm text-destructive">{errors.displayName.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="avatarUrl">Avatar URL</Label>
                        <Input id="avatarUrl" placeholder="https://..." {...register("avatarUrl")} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell people a bit about yourself" rows={4} {...register("bio")} />
                    </div>

                    {status && (
                        <div
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${status.type === "success"
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-destructive/20 bg-destructive/10 text-destructive"
                                }`}
                        >
                            {status.type === "success" ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                <AlertCircle className="size-4" />
                            )}
                            {status.message}
                        </div>
                    )}

                    <Button type="submit" disabled={isSubmitting} className="w-fit">
                        {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
