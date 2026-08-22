"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = {
    displayName: string;
    bio: string;
    showEmail: boolean;
};

type InitialProfile = {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    position: string | null;
    showEmail: boolean;
} | null;

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function ProfileEditForm({ initialProfile, email }: { initialProfile: InitialProfile; email: string }) {
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl ?? "");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormValues>({
        defaultValues: {
            displayName: initialProfile?.displayName ?? "",
            bio: initialProfile?.bio ?? "",
            showEmail: initialProfile?.showEmail ?? false,
        },
    });

    const displayName = watch("displayName");
    const showEmail = watch("showEmail");

    async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            setStatus({ type: "error", message: "Only PNG, JPEG, WEBP, or GIF images are allowed." });
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            setStatus({ type: "error", message: "Image must be smaller than 5MB." });
            return;
        }

        setStatus(null);
        setIsUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/profile/avatar", {
                method: "POST",
                body: formData,
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(payload.error || "Failed to upload your photo.");
            }

            setAvatarUrl(payload.avatarUrl);
            setStatus({ type: "success", message: "Your photo has been updated." });
        } catch (error) {
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Something went wrong.",
            });
        } finally {
            setIsUploadingAvatar(false);
        }
    }

    async function onSubmit(values: ProfileFormValues) {
        setStatus(null);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: values.displayName,
                    bio: values.bio || null,
                    showEmail: values.showEmail,
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
                        <div className="relative">
                            <Avatar className="size-16">
                                <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                                <AvatarFallback className="text-lg">
                                    {displayName?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                            {isUploadingAvatar && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                                    <Loader2 className="size-5 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {initialProfile.position && <Badge variant="secondary" className="w-fit">{initialProfile.position}</Badge>}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ALLOWED_AVATAR_TYPES.join(",")}
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-fit"
                                disabled={isUploadingAvatar}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-4" />
                                {isUploadingAvatar ? "Uploading..." : "Change photo"}
                            </Button>
                        </div>
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
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell people a bit about yourself" rows={4} {...register("bio")} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Email</Label>
                        <Input value={email} disabled readOnly />
                        <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Show email on public profile</span>
                                <span className="text-sm text-muted-foreground">
                                    Let others see your email when they view your profile.
                                </span>
                            </div>
                            <Switch
                                checked={showEmail}
                                onCheckedChange={(checked) => setValue("showEmail", checked, { shouldDirty: true })}
                            />
                        </div>
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

