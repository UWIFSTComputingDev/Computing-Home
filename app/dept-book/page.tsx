import { BookViewer } from "@/components/book-viewer"
import { bookPages } from "@/data/book-pages"

export default function DeptBookPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Header Section */}
        <section className="border-b border-[color:var(--border-color)] bg-gradient-to-b from-[color:var(--bg)] to-[color:var(--card)]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[color:var(--text)] sm:text-5xl text-balance">
                Department Book
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-[color:var(--muted)] leading-relaxed text-pretty">
                Explore our comprehensive department handbook with information about programs, faculty, and
                opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Book Viewer Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BookViewer pages={bookPages} />
          </div>
        </section>
      </main>
    </div>
  )
}
