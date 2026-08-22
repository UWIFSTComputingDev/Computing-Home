"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from "@dnd-kit/core"
import { CourseSidebar } from "@/components/course-sidebar"
import { YearTabs } from "@/components/year-tabs"
import { SemesterColumn } from "@/components/semester-column"
import { CourseChip } from "@/components/course-chip"
import { useRoadmap } from "@/context/roadmap-context"
import { RotateCcw, Menu, X } from "lucide-react"
import type { YearKey, Course, SemesterKey } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { canPlace } from "@/lib/utils/roadmap";
import { getCourseById } from "@/data/courses";

export default function RoadMapPage() {
  const [activeYear, setActiveYear] = useState<YearKey>("y1")
  const [activeCourse, setActiveCourse] = useState<Course | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { roadmap, addCourse, removeCourse, moveCourse, getSemesterCredits, reset } = useRoadmap()
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const course = event.active.data.current?.course
    if (course) {
      setActiveCourse(course)
    }
  }


  const semesterNames: Record<SemesterKey, string> = {
    s1: "Semester 1",
    s2: "Semester 2",
    s3: "Semester 3 (Summer)",
  };


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCourse(null);

    // Stop if drop target is invalid
    if (!over) {
      console.log("[Roadmap] No valid drop target");
      return;
    }

    // Extract course and drop data
    const course = active.data.current?.course as Course | undefined;
    const dropData = over.data.current as { year: YearKey; semester: SemesterKey } | undefined;

    console.log("[Roadmap] Drag end triggered:");
    console.log("  course:", course);
    console.log("  drop target:", dropData);

    if (!course || !dropData) {
      console.warn("[Roadmap] Missing course or drop data");
      return;
    }

    // ✅ Validate placement using helper
    const result = canPlace(course, { year: dropData.year, semester: dropData.semester }, roadmap);

    console.log("[Roadmap] canPlace result:", result);

    if (!result.ok) {
      toast({
        title: "Cannot add course",
        description: result.reason,
        variant: "destructive",
      });
      return;
    }

    const courseId = course.id;

    // Check if already placed
    let sourceYear: YearKey | null = null;
    let sourceSemester: string | null = null;

    for (const [year, semesters] of Object.entries(roadmap)) {
      for (const [sem, courses] of Object.entries(semesters)) {
        if (courses.includes(courseId)) {
          sourceYear = year as YearKey;
          sourceSemester = sem;
          break;
        }
      }
      if (sourceYear) break;
    }

    // Move course if already placed
    if (sourceYear && sourceSemester) {
      const success = moveCourse({ y: sourceYear, s: sourceSemester }, { y: dropData.year, s: dropData.semester }, courseId);
      if (!success) {
        toast({
          title: "Cannot move course",
          description: `This course is already placed in ${dropData.year.toUpperCase()}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Course moved",
          description: `${course.code} moved to ${dropData.semester.toUpperCase()}`,
        });
      }
    } else {
      // Add new course
      const success = addCourse(dropData.year, dropData.semester, courseId);
      if (!success) {
        toast({
          title: "Cannot add course",
          description: `This course is already placed in ${dropData.year.toUpperCase()}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Course added",
          description: `${course.code} added to ${dropData.semester.toUpperCase()}`,
        });
      }
    }
  };



  const handleRemove = (year: YearKey, semester: string, courseId: string) => {
    removeCourse(year, semester as any, courseId)
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your roadmap to the default template?")) {
      reset()
      toast({
        title: "Roadmap reset",
        description: "Your roadmap has been reset to the default template",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--text)]">Course RoadMap</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Drag and drop courses to plan your academic journey
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[color:var(--text)] transition-all hover:border-[color:var(--primary-color)] hover:bg-[color:var(--primary-color)]/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary-color)] text-white shadow-lg"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Sidebar */}
              <aside
                className={`fixed inset-y-0 left-0 z-40 w-80 transform bg-[color:var(--bg)] p-4 transition-transform lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:transform-none lg:p-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                  }`}
              >
                <CourseSidebar />
              </aside>

              {/* Main Content */}
              <div className="space-y-6">
                <YearTabs active={activeYear} onChange={setActiveYear} />

                <div className="rounded-xl border border-[color:var(--border-color)] bg-[color:var(--card)] p-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <SemesterColumn
                      label="Semester 1"
                      year={activeYear}
                      semester="s1"
                      courseIds={roadmap[activeYear].s1}
                      totalCredits={getSemesterCredits(activeYear, "s1")}
                      maxCredits={15}
                      onRemove={(courseId) => handleRemove(activeYear, "s1", courseId)}
                    />
                    <SemesterColumn
                      label="Semester 2"
                      year={activeYear}
                      semester="s2"
                      courseIds={roadmap[activeYear].s2}
                      totalCredits={getSemesterCredits(activeYear, "s2")}
                      maxCredits={18}
                      onRemove={(courseId) => handleRemove(activeYear, "s2", courseId)}
                    />
                    <SemesterColumn
                      label="Semester 3 (Summer)"
                      year={activeYear}
                      semester="s3"
                      courseIds={roadmap[activeYear].s3}
                      totalCredits={getSemesterCredits(activeYear, "s3")}
                      onRemove={(courseId) => handleRemove(activeYear, "s3", courseId)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay>{activeCourse ? <CourseChip course={activeCourse} isDragging /> : null}</DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  )
}