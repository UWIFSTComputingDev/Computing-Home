"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Roadmap, YearKey, SemesterKey } from "@/lib/types"
import { emptyRoadmap, defaultRoadmap } from "@/data/degree-template"
import { getCourseById } from "@/data/courses"

type RoadmapContextValue = {
  roadmap: Roadmap
  addCourse: (year: YearKey, sem: SemesterKey, courseId: string) => boolean
  removeCourse: (year: YearKey, sem: SemesterKey, courseId: string) => void
  moveCourse: (from: { y: YearKey; s: SemesterKey }, to: { y: YearKey; s: SemesterKey }, courseId: string) => boolean
  getSemesterCredits: (y: YearKey, s: SemesterKey) => number
  reset: () => void
  isCourseInYear: (year: YearKey, courseId: string) => boolean
}

const RoadmapContext = createContext<RoadmapContextValue | undefined>(undefined)

const STORAGE_KEY = "roadmap_v1"

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [roadmap, setRoadmap] = useState<Roadmap>(emptyRoadmap)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setRoadmap(JSON.parse(stored))
      } catch {
        setRoadmap(defaultRoadmap)
      }
    } else {
      setRoadmap(defaultRoadmap)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmap))
    }
  }, [roadmap, isLoaded])

  const isCourseInYear = (year: YearKey, courseId: string): boolean => {
    return Object.values(roadmap[year]).some((sem) => sem.includes(courseId))
  }

  const addCourse = (year: YearKey, sem: SemesterKey, courseId: string): boolean => {
    // Check if course already exists in this year
    if (isCourseInYear(year, courseId)) {
      return false
    }

    setRoadmap((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [sem]: [...prev[year][sem], courseId],
      },
    }))
    return true
  }

  const removeCourse = (year: YearKey, sem: SemesterKey, courseId: string) => {
    setRoadmap((prev) => ({
      ...prev,
      [year]: {
        ...prev[year],
        [sem]: prev[year][sem].filter((id) => id !== courseId),
      },
    }))
  }

  const moveCourse = (
    from: { y: YearKey; s: SemesterKey },
    to: { y: YearKey; s: SemesterKey },
    courseId: string,
  ): boolean => {
    // If moving to a different year, check for duplicates
    if (from.y !== to.y && isCourseInYear(to.y, courseId)) {
      return false
    }

    setRoadmap((prev) => {
      const newRoadmap = { ...prev }
      // Remove from source
      newRoadmap[from.y] = {
        ...newRoadmap[from.y],
        [from.s]: newRoadmap[from.y][from.s].filter((id) => id !== courseId),
      }
      // Add to destination
      newRoadmap[to.y] = {
        ...newRoadmap[to.y],
        [to.s]: [...newRoadmap[to.y][to.s], courseId],
      }
      return newRoadmap
    })
    return true
  }

  const getSemesterCredits = (y: YearKey, s: SemesterKey): number => {
    return roadmap[y][s].reduce((sum, courseId) => {
      const course = getCourseById(courseId)
      return sum + (course?.credits || 0)
    }, 0)
  }

  const reset = () => {
    setRoadmap(defaultRoadmap)
  }

  return (
    <RoadmapContext.Provider
      value={{
        roadmap,
        addCourse,
        removeCourse,
        moveCourse,
        getSemesterCredits,
        reset,
        isCourseInYear,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  )
}

export function useRoadmap() {
  const context = useContext(RoadmapContext)
  if (!context) {
    throw new Error("useRoadmap must be used within RoadmapProvider")
  }
  return context
}
