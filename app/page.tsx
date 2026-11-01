import {
  ArrowDownRight,
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Map,
  NotebookPen,
  Users,
} from "lucide-react"
import Link from "next/link"

import { FeatureCard } from "@/components/feature-card"
import { HomeHeroSlider } from "@/components/home-hero-slider"

const highlights = [
  { icon: Users, value: "500+", label: "students in our community" },
  { icon: GraduationCap, value: "24+", label: "credits to plan for" },
  { icon: Award, value: "95%", label: "student success rate" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.03fr_0.97fr] lg:gap-14">
          <div className="relative z-10">
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Build a future in{" "}
              <span className="bg-linear-to-r from-blue-500 via-sky-400 to-blue-600 bg-clip-text text-transparent">
                computing.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-(--muted) sm:text-xl">
              Your home for learning, planning, and finding your people in the
              Computing Department.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/roadmap"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(30,144,255,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(30,144,255,0.32)]"
              >
                Start planning
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-(--card)/65 px-6 py-3 font-semibold text-(--text) shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-(--card)"
              >
                Explore courses
                <ArrowDownRight className="size-4 text-primary" />
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {highlights.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/60 bg-white/45 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-4"
                >
                  <Icon className="mb-3 size-4 text-primary sm:size-5" />
                  <p className="text-xl font-bold tracking-tight text-(--text) sm:text-2xl">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-(--muted) sm:text-xs">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-linear-to-br from-blue-400/20 via-sky-300/10 to-transparent blur-2xl" />
            <div className="relative rounded-[1.7rem] border border-white/70 bg-white/35 p-2.5 shadow-[0_32px_90px_rgba(23,78,135,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] sm:rounded-[2rem] sm:p-3">
              <div className="relative aspect-[1.15] overflow-hidden rounded-[1.25rem] border border-white/60 bg-(--card) shadow-inner dark:border-white/10 sm:aspect-[1.2] sm:rounded-[1.5rem]">
                <HomeHeroSlider />
              </div>
              <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-3 sm:px-3 sm:pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Map className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-(--text)">
                      Your journey, mapped out
                    </p>
                    <p className="truncate text-xs text-(--muted)">
                      Explore what you can build
                    </p>
                  </div>
                </div>
                <Link
                  href="/tree"
                  className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-blue-700 dark:hover:text-blue-300"
                >
                  View roadmap
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 pt-10 sm:px-6 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-(--text) sm:text-4xl">
                Everything you need to move forward.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-(--muted) sm:text-base">
              Find the tools and community to make your time in computing count.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Degree planner"
              description="Shape your academic journey with an interactive course planner. Build a plan that works for you."
              href="/roadmap"
              icon={NotebookPen}
            />
            <FeatureCard
              title="Department book"
              description="Get to know our programs, faculty, student community, and opportunities."
              href="/dept-book"
              icon={BookOpen}
            />
            <FeatureCard
              title="Course roadmap"
              description="See how courses connect and explore the prerequisites behind your degree."
              href="/tree"
              icon={Map}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
