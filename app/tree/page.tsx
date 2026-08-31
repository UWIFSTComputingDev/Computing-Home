'use client';
// app/tree/page.tsx

import { CourseMarker } from "@/components/course-tree"
import { BookOpen, Map, GraduationCap, BriefcaseBusiness, Gem, Presentation } from "lucide-react"
import { useState } from 'react';
import { courses } from "@/data/courses";
import Link from "next/link"


const degreeOptions = [
  { key: 'bscs', label: 'B.Sc. Computer Science' },
  { key: 'bsse', label: 'B.Sc. Software Engineering' },
  { key: 'bita', label: 'B.Sc. Information Technology' },
  { key: 'bscy', label: 'B.Sc. Cyber Security' },
];

const yearOptions = [
  { key: 1, label: 'Year 1' },
  { key: 2, label: 'Year 2' },
  { key: 3, label: 'Year 3' },
];

// --- Define Course Data ---
type VisualInfo = {
  position: string;
  icon: any;
};
// The 'position' is a percentage from the left (0% to 100%)
const visualMetadata: Record<string, VisualInfo> = {
  "COMP1126": { position: "10%", icon: BookOpen },
  "COMP1127": { position: "15%", icon: BookOpen },
  "COMP1161": { position: "20%", icon: GraduationCap },
  "COMP1210": { position: "25%", icon: Map },
  "COMP1220": { position: "30%", icon: Map },
  "COMP2130": { position: "40%", icon: GraduationCap },
  "COMP2140": { position: "45%", icon: BookOpen },
  "COMP2171": { position: "36%", icon: Map },
  "COMP2190": { position: "50%", icon: Map },
  "COMP2201": { position: "55%", icon: GraduationCap },
  "COMP2211": { position: "65%", icon: Map },
  "INFO2101": { position: "60%", icon: BookOpen },
  "INFO2111": { position: "64%", icon: GraduationCap },
  "INFO2180": { position: "48%", icon: Map },
  "COMP2340": { position: "52%", icon: Map },
  "COMP3101": { position: "85%", icon: GraduationCap },
  "INFO3106": { position: "68%", icon: GraduationCap },
  "INFO3110": { position: "72%", icon: Gem },
  "COMP3161": { position: "71%", icon: GraduationCap },
  "INFO3155": { position: "74%", icon: GraduationCap },
  "INFO3165": { position: "78%", icon: GraduationCap },
  "INFO3171": { position: "76%", icon: GraduationCap },
  "INFO3180": { position: "80%", icon: GraduationCap },
  "COMP3220": { position: "82%", icon: GraduationCap },
  "COMP3911": { position: "90%", icon: BriefcaseBusiness },
  "COMP3901": { position: "98%", icon: Presentation },
  "SWEN3130": { position: "90%", icon: BookOpen },
  "SWEN3145": { position: "95%", icon: Map },
  "SWEN3165": { position: "70%", icon: GraduationCap },
  "SWEN3185": { position: "75%", icon: BookOpen },
  "SWEN3920": { position: "80%", icon: Map },
};
export default function RoadmapPage() {
  const [selectedDegree, setSelectedDegree] = useState('bscs');
  const [selectedYear, setSelectedYear] = useState(0);

  const filteredCourses = courses
    .filter(course => {
      const hasPosition = visualMetadata[course.id];
      if (!hasPosition) return false;

      const degreeMatch = selectedDegree === 'all' ||
        (course.degrees?.includes(selectedDegree) ?? false);


      const yearMatch = course.year === `y${selectedYear}`;

      return degreeMatch && yearMatch;
    })
    .map(course => ({
      ...course,
      ...visualMetadata[course.id],
      title: `${course.code}: ${course.name}`,
      description: `${course.description}. Credits: ${course.credits}. Offered: ${course.offered.join(', ')}`
    }));

  // Find the current degree label for the title
  const currentDegreeLabel = degreeOptions.find(d => d.key === selectedDegree)?.label || 'Roadmap';

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        {/* Degree Selection Sub-Menu */}
        <div className="flex justify-center flex-wrap gap-4 mb-4 border-b border-[color:var(--border-color)] pb-6">
          {degreeOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedDegree(option.key)}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${selectedDegree === option.key
                  ? "bg-[color:var(--primary-color)] text-white shadow-lg scale-105"
                  : "bg-[color:var(--card)] text-[color:var(--text)] hover:bg-[color:var(--border-color)] border border-[color:var(--border-color)]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Academic Year Filter */}
        <div className="flex justify-center space-x-3 mb-10">
          {yearOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedYear(option.key)}
              className={`px-5 py-1.5 text-xs font-bold rounded-full border transition-all ${selectedYear === option.key
                  ? "bg-[color:var(--primary-color)] border-[color:var(--primary-color)] text-white"
                  : "bg-transparent border-[color:var(--border-color)] text-[color:var(--muted)] hover:border-[color:var(--primary-color)]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--text)] text-center mb-16">
          {currentDegreeLabel} Roadmap
        </h1>

        {/* --- SEMESTER SPLIT VIEW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* SEMESTER 1 COLUMN */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-4 border-[color:var(--primary-color)] pb-3">
              <h2 className="text-2xl font-black uppercase text-[color:var(--text)]">Semester 1</h2>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase">Credit Load</span>
                <p className="text-sm font-bold text-[color:var(--primary-color)]">Min 15 / Max 18 Credits</p>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredCourses
                .filter(course => course.offered.includes('s1'))
                .map((course) => (
                  <div
                    key={course.id}
                    className="group relative rounded-xl border-2 border-[color:var(--border-color)] bg-[color:var(--card)] p-6 transition-all hover:border-[color:var(--primary-color)] hover:shadow-xl"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <span className="rounded-md bg-[color:var(--primary-color)]/10 px-2 py-1 text-xs font-black text-[color:var(--primary-color)]">
                        {course.code}
                      </span>
                      <span className="text-xs font-bold text-[color:var(--muted)]">
                        {course.credits} Credits
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[color:var(--text)] leading-tight">
                      {course.name}
                    </h3>
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[color:var(--border-color)] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-widest">Year {selectedYear} Core</span>
                      <Link
                        href={`/course/${course.id}`}
                        className="text-xs font-semibold text-[color:var(--primary-color)] hover:underline"
                      >
                        Advice & questions
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* SEMESTER 2 COLUMN */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-4 border-[color:var(--accent-color)] pb-3">
              <h2 className="text-2xl font-black uppercase text-[color:var(--text)]">Semester 2</h2>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase">Credit Load</span>
                <p className="text-sm font-bold text-[color:var(--accent-color)]">Min 18 / Max 21 Credits</p>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredCourses
                .filter(course => course.offered.includes('s2'))
                .map((course) => (
                  <div
                    key={course.id}
                    className="group relative rounded-xl border-2 border-[color:var(--border-color)] bg-[color:var(--card)] p-6 transition-all hover:border-[color:var(--accent-color)] hover:shadow-xl"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <span className="rounded-md bg-[color:var(--accent-color)]/10 px-2 py-1 text-xs font-black text-[color:var(--accent-color)]">
                        {course.code}
                      </span>
                      <span className="text-xs font-bold text-[color:var(--muted)]">
                        {course.credits} Credits
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[color:var(--text)] leading-tight">
                      {course.name}
                    </h3>
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed line-clamp-3">
                      {course.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-[color:var(--border-color)] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[color:var(--muted)] uppercase tracking-widest">Year {selectedYear} Core</span>
                      <Link
                        href={`/course/${course.id}`}
                        className="text-xs font-semibold text-[color:var(--accent-color)] hover:underline"
                      >
                        Advice & questions
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Matriculation Alert */}
        <div className="mt-16 bg-[color:var(--primary-color)]/5 border-l-4 border-[color:var(--primary-color)] p-6 max-w-4xl mx-auto rounded-r-xl">
          {selectedYear === 1 ? (
            <p className="text-sm font-medium text-[color:var(--text)]">
              <strong>Note:</strong> You need a total of <strong>24 level-one credits</strong> to matriculate into your second year.
              Foundation courses (like FOUN1014) are mandatory but do not count toward this 24-credit requirement.
            </p>
          ) : (
            <p className="text-sm font-medium text-[color:var(--text)]">
              <strong>Note:</strong> For graduation requirements and credit loading rules beyond Year 1, please refer to the official
              <Link href="/dept-book" className="text-[color:var(--primary-color)] hover:underline ml-1">
                Department Handbook
              </Link>.
            </p>
          )}
        </div>

      </main>
    </div>
  )
}