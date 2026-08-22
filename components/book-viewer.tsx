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
  }, [currentPage])

  const goToNext = () => {
  // Increment by 2 to turn a full "spread"
  if (currentPage + 2 < pages.length) {
    setCurrentPage((prev) => prev + 2);
  }
 };

const goToPrevious = () => {
  if (currentPage - 2 >= 0) {
    setCurrentPage((prev) => prev - 2);
  }
 };

  const leftPage = pages[currentPage];
  const rightPage = (currentPage + 1 < pages.length) ? pages[currentPage + 1] : null;

  return (
    <div className="relative mx-auto max-w-6xl">
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        disabled={currentPage === 0}
        className="absolute left-0 top-1/2 z-10 -translate-x-12 -translate-y-1/2 rounded-full border border-[color:var(--border-color)] bg-[color:var(--card)] p-3 text-[color:var(--text)] shadow-lg transition-all hover:border-[color:var(--primary-color)] hover:bg-[color:var(--primary-color)]/10 disabled:opacity-30 disabled:hover:border-[color:var(--border-color)] disabled:hover:bg-[color:var(--card)]"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        disabled={currentPage >= pages.length - 1}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-12 rounded-full border border-[color:var(--border-color)] bg-[color:var(--card)] p-3 text-[color:var(--text)] shadow-lg transition-all hover:border-[color:var(--primary-color)] hover:bg-[color:var(--primary-color)]/10 disabled:opacity-30 disabled:hover:border-[color:var(--border-color)] disabled:hover:bg-[color:var(--card)]"
        aria-label="Next page"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Book Container */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[color:var(--border-color)] bg-[color:var(--card)] shadow-2xl">
        <div className="grid md:grid-cols-2">
          {/* Left Page */}
          {leftPage && (
            <div className="border-r border-[color:var(--border-color)] p-8 md:p-12">
              <BookPageContent page={leftPage} />
            </div>
          )}

          {/* Right Page */}
          {rightPage && (
            <div className={`p-8 md:p-12 ${!leftPage ? "md:col-span-2" : ""}`}>
              <BookPageContent page={rightPage} />
            </div>
          )}
        </div>

        {/* Page Number Indicator */}
        <div className="border-t border-[color:var(--border-color)] bg-[color:var(--bg)]/50 px-6 py-3 text-center">
          <span className="text-sm text-[color:var(--muted)]">
            Page {currentPage + 1} of {pages.length}
          </span>
        </div>
      </div>

      {/* Touch/Swipe Instructions */}
      <div className="mt-4 text-center">
        <p className="text-sm text-[color:var(--muted)]">Use arrow keys or click the arrows to navigate</p>
      </div>
    </div>
  )
}


function BookPageContent({ page }: { page: BookPage }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col gap-6 text-left">
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