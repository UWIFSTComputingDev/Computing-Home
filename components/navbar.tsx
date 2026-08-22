"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"


const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "RoadMap", href: "/tree" },
  { name: "Degree Planner", href: "/roadmap" },
  { name: "Dept. Book", href: "/dept-book" },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-(--bg)/95 backdrop-blur supports-backdrop-filter:bg-(--bg)/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/cs_logo.png"
              alt="Computer Science Logo"
              width={48}
              height={48}
              className="rounded-full border-2 border-primary object-cover bg-white"
            />
            <span className="text-xl font-bold text-primary">Computing Department</span>

          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${isActive
                        ? "bg-(--card)/60 text-primary underline decoration-primary decoration-2 underline-offset-4"
                        : "text-(--muted) hover:bg-(--card)/40 hover:text-(--text)"
                      }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg p-2 text-(--muted) hover:bg-(--card)/40"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-(--card) md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-lg px-3 py-2 text-base font-medium ${isActive
                      ? "bg-(--primary-color)/10 text-primary"
                      : "text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
