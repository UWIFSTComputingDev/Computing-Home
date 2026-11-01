"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AuthMode = "login" | "register"

type AuthFormValues = {
  email: string
  password: string
  displayName: string
}

type AuthStatus = {
  type: "success" | "error"
  message: string
}

type Inspiration = {
  image: {
    title: string
    imageUrl: string
    sourceUrl: string
    artist: string
    license: string
  }
  fact: {
    title: string
    extract: string
    sourceUrl: string
  }
}

const defaultValues: AuthFormValues = {
  email: "",
  password: "",
  displayName: "",
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [inspiration, setInspiration] = useState<Inspiration | null>(null)
  const [inspirationLoading, setInspirationLoading] = useState(true)
  const [inspirationError, setInspirationError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AuthFormValues>({ defaultValues })

  const loadInspiration = useCallback(async () => {
    setInspirationLoading(true)
    setInspirationError(null)

    try {
      const response = await fetch("/api/inspiration", { cache: "no-store" })
      const payload = (await response.json()) as Inspiration & { error?: string }
      if (!response.ok || !payload.image || !payload.fact) {
        throw new Error(payload.error || "Unable to load computing inspiration.")
      }

      setInspiration(payload)
    } catch (error) {
      console.error("Unable to load computing inspiration.", error)
      setInspirationError("A fresh computing fact is unavailable right now.")
    } finally {
      setInspirationLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadInspiration()
  }, [loadInspiration])

  async function onSubmit(values: AuthFormValues) {
    setStatus(null)

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Authentication failed.")
      }

      if (mode === "login") {
        router.replace("/")
        router.refresh()
        return
      }

      setStatus({
        type: "success",
        message: "Your account has been created. You can now sign in.",
      })
      setMode("login")
      reset(defaultValues)
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong.",
      })
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode)
    setStatus(null)
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-border/80 bg-(--card)/55 shadow-[0_30px_90px_rgba(16,54,93,0.12)] backdrop-blur-2xl md:min-h-[620px] md:grid-cols-[1.02fr_0.98fr]">
        <section className="auth-story order-2 flex min-h-72 flex-col justify-between p-7 sm:p-10 md:order-1 md:min-h-full md:p-12">
          <div
            className="auth-story-image"
            aria-hidden="true"
            style={
              inspiration
                ? { backgroundImage: `url("${inspiration.image.imageUrl}")` }
                : undefined
            }
          />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10 p-1.5">
              <Image
                src="/cs_logo.png"
                alt=""
                width={40}
                height={40}
                className="size-full rounded-lg object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Computing Home</p>
              <p className="mt-0.5 text-xs text-blue-100/70">University of the West Indies</p>
            </div>
          </div>

          <div className="relative z-10 mt-12 max-w-lg md:mt-0">
            <p className="max-w-md text-base leading-7 text-blue-50/75">
              Your department hub for planning your degree, exploring course
              pathways, and staying connected.
            </p>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100/70">
              A computing fact for this visit
            </p>
            {inspirationLoading ? (
              <p className="text-sm text-blue-50/70" role="status">
                Finding something interesting…
              </p>
            ) : inspirationError ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-blue-50/75">
                <p role="status">{inspirationError}</p>
                <button
                  type="button"
                  onClick={() => void loadInspiration()}
                  className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  Try again
                </button>
              </div>
            ) : inspiration ? (
              <>
                <blockquote className="text-sm leading-6 text-white/90 sm:text-base sm:leading-7">
                  {inspiration.fact.extract}
                </blockquote>
                <p className="mt-3 text-xs leading-5 text-blue-100/70">
                  From{" "}
                  <a
                    href={inspiration.fact.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-white underline decoration-white/35 underline-offset-4 hover:decoration-white"
                  >
                    {inspiration.fact.title}
                  </a>
                  {" · "}
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-white/25 underline-offset-4 hover:decoration-white"
                  >
                    Wikipedia, CC BY-SA
                  </a>
                </p>
                <p className="mt-2 text-[11px] text-blue-100/55">
                  Image:{" "}
                  <a
                    href={inspiration.image.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-white/25 underline-offset-4 hover:decoration-white"
                  >
                    {inspiration.image.artist}
                  </a>
                  {" · "}
                  {inspiration.image.license}
                </p>
              </>
            ) : null}
          </div>
        </section>

        <section className="order-1 flex items-center justify-center p-5 sm:p-9 md:order-2 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 grid grid-cols-2 border-b border-border" role="tablist" aria-label="Account access">
              {(["login", "register"] as const).map((value) => {
                const isSelected = mode === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => changeMode(value)}
                    className={`relative px-3 pb-3 text-sm font-medium transition-colors ${isSelected
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {value === "login" ? "Sign in" : "Create account"}
                    {isSelected && (
                      <motion.span
                        layoutId="auth-tab-indicator"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {mode === "login"
                  ? "Sign in to continue to your department portal."
                  : "Set up an account to join the Computing Home community."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {mode === "register" && (
                  <div className="space-y-2">
                    <label htmlFor="display-name" className="text-sm font-medium text-foreground">
                      Display name
                    </label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="display-name"
                        autoComplete="name"
                        placeholder="Your name"
                        className="h-12 pl-10"
                        {...register("displayName")}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-12 pl-10"
                      {...register("email", { required: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
                      className="h-12 pl-10"
                      {...register("password", { required: true, minLength: 8 })}
                    />
                  </div>
                  {mode === "register" && (
                    <p className="text-xs text-muted-foreground">
                      Use at least 8 characters.
                    </p>
                  )}
                </div>

                {status && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl border px-3.5 py-3 text-sm leading-5 ${status.type === "success"
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-destructive/20 bg-destructive/10 text-destructive"
                      }`}
                  >
                    {status.message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full justify-between rounded-xl px-5 font-semibold shadow-[0_10px_24px_rgba(30,144,255,0.2)]"
                >
                  {isSubmitting
                    ? "Please wait..."
                    : mode === "login"
                      ? "Sign in"
                      : "Create account"}
                  <ArrowRight className="size-4" />
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  )
}
