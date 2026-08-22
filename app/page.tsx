import { FeatureCard } from "@/components/feature-card"
import { Map, BookOpen, NotebookPen, Sparkles, ArrowRight, Users, GraduationCap, Award } from "lucide-react"
import { HomeHeroSlider } from "@/components/home-hero-slider"
import Link from "next/link"
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Animated Background Blobs from example */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge with your wording */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-8 animate-fade-in border border-blue-100">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">Explore Your Academic Journey</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-(--text) mb-6 text-balance">
                Welcome to the <br />
                <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  Computing Department
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-(--muted) leading-relaxed text-pretty">
                Discover the resources available to help you succeed in your computer
                science education.
              </p>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link href="/roadmap" className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all flex items-center">
                  Start Planning
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/tree" className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all border border-gray-100">
                  View Roadmap
                </Link>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-(--text)">500+</h3>
                <p className="text-(--muted)">Active Students</p>
              </div>
              <div className="text-center p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-(--text)">24+</h3>
                <p className="text-(--muted)">Level 1 Credits Needed</p>
              </div>
              <div className="text-center p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-(--text)">95%</h3>
                <p className="text-(--muted)">Success Rate</p>
              </div>
            </div>

            {/* Slider container is now OUTSIDE the stats grid div */}
            <div className="mx-auto mt-16 max-w-5xl">
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-(--card) shadow-2xl">
                <HomeHeroSlider />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
            <h2 className="text-4xl font-bold text-(--text)">Everything You Need to <span className="text-blue-600">Succeed</span></h2>
            <p className="mt-4 text-(--muted)">Access powerful tools designed to help you plan, track, and achieve your academic goals.</p>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                title="Degree Planner"
                description="Plan your academic journey with our interactive course roadmap. Drag and drop courses to create your personalized degree plan."
                href="/roadmap"
                icon={NotebookPen}
              />
              <FeatureCard
                title="Department Book"
                description="Browse through our comprehensive department handbook. Learn about our programs, faculty, and research opportunities."
                href="/dept-book"
                icon={BookOpen}
              />
              <FeatureCard
                title="Road Map"
                description="Visualize your course dependencies and prerequisites in a clear, easy-to-navigate interface."
                href="/tree"
                icon={Map}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}