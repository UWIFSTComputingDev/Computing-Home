"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { BookPage } from "@/lib/types"

interface BookViewerProps {
  pages: BookPage[]
}

export function BookViewer({ pages }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isSinglePage, setIsSinglePage] = useState(false)
  const [turningPage, setTurningPage] = useState<{
    direction: "next" | "previous"
    frontPage: BookPage
    backPage: BookPage
  } | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const updatePageLayout = () => {
      setIsSinglePage(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setCurrentPage((page) => page - (page % 2))
      }
    }
    updatePageLayout()
    mediaQuery.addEventListener("change", updatePageLayout)
    return () => mediaQuery.removeEventListener("change", updatePageLayout)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentPage, isSinglePage, turningPage])

  const goToNext = () => {
    const pageStep = isSinglePage ? 1 : 2
    if (!turningPage && currentPage + pageStep < pages.length) {
      const nextPage = currentPage + pageStep
      const frontPage = pages[isSinglePage ? currentPage : currentPage + 1]
      const backPage = pages[nextPage]
      if (frontPage && backPage) {
        setTurningPage({ direction: "next", frontPage, backPage })
        setCurrentPage(nextPage)
      }
    }
  }

  const goToPrevious = () => {
    const pageStep = isSinglePage ? 1 : 2
    if (!turningPage && currentPage >= pageStep) {
      const previousPage = currentPage - pageStep
      const frontPage = pages[currentPage]
      const backPage = pages[isSinglePage ? previousPage : previousPage + 1]
      if (frontPage && backPage) {
        setTurningPage({ direction: "previous", frontPage, backPage })
        setCurrentPage(previousPage)
      }
    }
  }

  const leftPage = pages[currentPage];
  const rightPage = !isSinglePage && currentPage + 1 < pages.length ? pages[currentPage + 1] : null
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage + (isSinglePage ? 1 : 2) >= pages.length

  return (
    <div className="relative mx-auto max-w-6xl px-1 pb-5 pt-2 sm:px-8">
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        disabled={isFirstPage || turningPage !== null}
        className="absolute left-0 top-1/2 z-20 -translate-x-1/3 -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/85 p-3 text-white shadow-xl transition hover:bg-slate-800 disabled:opacity-30 sm:-translate-x-1/2"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        disabled={isLastPage || turningPage !== null}
        className="absolute right-0 top-1/2 z-20 translate-x-1/3 -translate-y-1/2 rounded-full border border-white/20 bg-slate-950/85 p-3 text-white shadow-xl transition hover:bg-slate-800 disabled:opacity-30 sm:translate-x-1/2"
        aria-label="Next page"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Book Container */}
      <div className="book-shell relative rounded-[1.4rem] p-2.5 shadow-[0_35px_80px_rgba(4,17,34,0.42)] sm:rounded-[2rem] sm:p-4">
        <div
          key={currentPage}
          className="book-spread relative flex h-[min(76svh,760px)] min-h-[480px] flex-col overflow-hidden rounded-xl sm:rounded-2xl"
        >
          <div className={`grid min-h-0 flex-1 ${isSinglePage ? "grid-rows-1" : "grid-rows-2"} md:grid-cols-2 md:grid-rows-1`}>
            {/* Left Page */}
            {leftPage && (
              <div className="book-page book-page-left relative min-h-0 overflow-y-auto border-b-0 p-6 sm:p-9 md:border-b-0 md:border-r md:p-12">
                <BookPageContent page={leftPage} />
              </div>
            )}

            {/* Right Page */}
            {rightPage && (
              <div className="book-page book-page-right relative min-h-0 overflow-y-auto p-6 sm:p-9 md:p-12">
                <BookPageContent page={rightPage} />
              </div>
            )}
          </div>

          <div className="book-page flex shrink-0 items-center justify-between border-t border-[#8d6a3d]/20 px-5 py-3 text-xs font-semibold tracking-wide sm:px-8">
            <span>DEPARTMENT OF COMPUTING</span>
            <span>{currentPage + 1}{rightPage ? `–${currentPage + 2}` : ""} / {pages.length}</span>
          </div>
          {turningPage && (
            <div
              aria-hidden="true"
              className={`book-turn-leaf book-turn-${turningPage.direction}`}
              onAnimationEnd={() => setTurningPage(null)}
            >
              <div className="book-turn-face book-turn-front book-page p-6 sm:p-9 md:p-12">
                <BookPageContent page={turningPage.frontPage} />
              </div>
              <div className="book-turn-face book-turn-back book-page p-6 sm:p-9 md:p-12">
                <BookPageContent page={turningPage.backPage} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Touch/Swipe Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-[color:var(--muted)]">Use arrow keys or the page-turn buttons to browse</p>
      </div>
    </div>
  )
}


function BookPageContent({ page }: { page: BookPage }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 text-left">
      {/* 1. Title */}
      {page.title && <h2 className="text-2xl font-bold text-[color:var(--text)]">{page.title}</h2>}

      {/* 2. Multiple Sections (Subtitle + Body pairs) */}
      {/* Use this for the "Other Useful Websites" page */}
      {page.sections && page.sections.map((section, index) => (
        <div key={index} className="space-y-2">
          {section.subtitle && (
            <div className="flex items-center gap-2">
              {section.link ? (
                <a href={section.link} target="_blank" rel="noopener noreferrer" 
                   className="text-lg font-semibold text-blue-600 hover:underline">
                  {section.subtitle}
                </a>
              ) : (
                <h3 className="text-lg font-semibold text-blue-600">{section.subtitle}</h3>
              )}
            </div>
          )}
          {section.body && (
            <p className="text-[color:var(--muted)] leading-relaxed text-sm">
              {section.body}
            </p>
          )}
        </div>
      ))}

      {/* 3. Single Subheading Logic (Only if NOT using sections) */}
      {!page.sections && page.subtitle && (
        <div className="-mt-4">
          {page.link && !page.linkText ? (
            <a href={page.link} target="_blank" rel="noopener noreferrer" 
               className="text-lg font-semibold text-blue-600 hover:underline">
              {page.subtitle}
            </a>
          ) : (
            <h3 className="text-lg font-semibold text-blue-600">{page.subtitle}</h3>
          )}
        </div>
      )}
      
      {/* 4. Single Body Content (Only if NOT using sections) */}
      {!page.sections && page.body && (
        <div className="text-[color:var(--muted)] leading-relaxed">
          {page.link && page.linkText ? (
            <p>
              {page.body}
              <a href={page.link} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-600 font-bold hover:underline ml-1">
                {page.linkText}
              </a>
            </p>
          ) : (
            <p className="whitespace-pre-line">{page.body}</p>
          )}
        </div>
      )}

      {/* 5. Table Logic with Safety Check */}
      {page.tableData && (
        <div className="overflow-x-auto rounded-xl border border-[color:var(--border-color)]">
          <table className="w-full text-sm text-left">
            <thead className="bg-[color:var(--muted)]/5 text-[color:var(--text)] font-bold">
              <tr>
                {page.tableData[0].map((header, i) => (
                  <th key={i} className="px-4 py-3 border-b border-[color:var(--border-color)]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[color:var(--border-color)] last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      {/* Email detection logic */}
                      {cell.includes("@") ? (
                        <a 
                          href={`mailto:${cell}`} 
                          className="text-blue-600 font-medium hover:underline transition-colors"
                        >
                          {cell}
                        </a>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 6. Image Logic - Fixed for Sizing */}
      {page.image && (
        <div className="relative mt-auto w-full aspect-video overflow-hidden rounded-xl border border-[color:var(--border-color)] bg-black/5">
          <Image 
            src={page.image} 
            alt={page.title || "illustration"} 
            fill 
            className="object-contain" // Changed from object-cover to prevent cutting off
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true}
          />
        </div>
      )}
    </div>
  )
}