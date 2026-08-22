"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

type AuthMode = "login" | "register";

type AuthFormValues = {
    email: string;
    password: string;
    displayName: string;
};

const defaultValues: AuthFormValues = {
    email: "",
    password: "",
    displayName: "",
};

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("login");
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<AuthFormValues>({ defaultValues });

    async function onSubmit(values: AuthFormValues) {
        setStatus(null);
        let success = false;

        try {
            const response = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.error || "Authentication failed.");
            }

            setStatus({
                type: "success",
                message: mode === "register" ? "Your account has been created." : "Signed in successfully.",
            });

            reset();
            success = true;
        } catch (error) {
            setStatus({
                type: "error",
                message: error instanceof Error ? error.message : "Something went wrong.",
            });
        }

        if (success && mode === "login")
            redirect("/");
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:py-12">
            <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-border bg-surface md:grid-cols-[1.1fr_0.9fr]">
                <section className="relative flex min-h-55 flex-col justify-end overflow-hidden p-8 sm:min-h-70 md:min-h-0 md:justify-between md:p-10">
                    <Image
                        src="/auth-cover.svg"
                        alt=""
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/20 md:bg-linear-to-r md:from-background md:via-background/75 md:to-transparent" />

                    <div className="relative space-y-3 md:space-y-4">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Sign in to Computing Home
                        </h1>
                        <p className="max-w-md text-sm leading-6 text-foreground/80 sm:text-base sm:leading-7">

                        </p>
                    </div>
                </section>

                <section className="flex items-center justify-center p-4 sm:p-6 md:p-8">
                    <Card className="w-full max-w-md border-none bg-transparent">
                        <CardHeader className="pb-4">
                            <div className="mb-5 flex gap-6 border-b border-border">
                                {(["login", "register"] as const).map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setMode(value)}
                                        className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${mode === value ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"
                                            }`}
                                    >
                                        {value === "login" ? "Sign in" : "Create account"}
                                    </button>
                                ))}
                            </div>

                            <CardTitle className="text-2xl">
                                {mode === "login" ? "Welcome back" : "Set up your account"}
                            </CardTitle>
                            <CardDescription>
                                {mode === "login"
                                    ? "Use your email and password to continue."
                                    : "Create a secure account with a profile name."}
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <AnimatePresence mode="wait">
                                <motion.form
                                    key={mode}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-4"
                                >
                                    {mode === "register" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground/80">Display name</label>
                                            <Input placeholder="Jane Doe" {...register("displayName")} />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="name@company.com"
                                            {...register("email", { required: true })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Minimum 8 characters"
                                            {...register("password", { required: true, minLength: 8 })}
                                        />
                                    </div>

                                    {mode === "login" && (
                                        <div aria-hidden className="invisible space-y-2">
                                            <label className="text-sm font-medium text-foreground/80">Display name</label>
                                            <Input tabIndex={-1} disabled />
                                        </div>
                                    )}

                                    {status && (
                                        <div
                                            className={`rounded-lg border px-3 py-2 text-sm ${status.type === "success"
                                                ? "border-success/20 bg-success/10 text-success"
                                                : "border-destructive/20 bg-destructive/10 text-destructive"
                                                }`}
                                        >
                                            {status.message}
                                        </div>
                                    )}

                                    <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                                        {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </motion.form>
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </main>
    );
}
