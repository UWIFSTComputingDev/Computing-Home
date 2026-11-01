"use client"

import { useEffect } from "react"

export function AmbientBackground() {
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)")
    let frame = 0
    let pointerX = 0
    let pointerY = 0

    function updatePointer(event: PointerEvent) {
      if (!pointerQuery.matches || event.pointerType !== "mouse") return

      pointerX = (event.clientX / window.innerWidth) * 100
      pointerY = (event.clientY / window.innerHeight) * 100

      if (frame) return
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${pointerX}%`)
        document.documentElement.style.setProperty("--pointer-y", `${pointerY}%`)
        frame = 0
      })
    }

    window.addEventListener("pointermove", updatePointer, { passive: true })
    return () => {
      window.removeEventListener("pointermove", updatePointer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="ambient-background" aria-hidden="true">
      <span className="ambient-orb ambient-orb-one" />
      <span className="ambient-orb ambient-orb-two" />
      <span className="ambient-orb ambient-orb-three" />
    </div>
  )
}
