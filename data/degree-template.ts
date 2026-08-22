import type { Roadmap } from "@/lib/types"

export const emptyRoadmap: Roadmap = {
  y1: { s1: [], s2: [], s3: [] },
  y2: { s1: [], s2: [], s3: [] },
  y3: { s1: [], s2: [], s3: [] },
}

export const defaultRoadmap: Roadmap = {
  y1: {
    s1: ["cs101", "math101", "eng101", "hist101"],
    s2: ["cs102", "math102", "phys101", "chem101"],
    s3: [],
  },
  y2: {
    s1: ["cs201", "cs202", "math201", "eng201"],
    s2: ["cs203", "cs204", "stat201", "econ101"],
    s3: [],
  },
  y3: {
    s1: ["cs301", "cs302", "cs303", "phil201"],
    s2: ["cs304", "cs305", "cs401"],
    s3: ["cs402"],
  },
}
