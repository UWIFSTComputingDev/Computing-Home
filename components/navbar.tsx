"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LayoutDashboard, User as UserIcon, LogOut, LogIn } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type CurrentUser = {
  id: string
  email: string
  role: "user" | "admin"
  profile?: {
    displayName: string
    avatarUrl: string | null
  }
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Roadmap", href: "/tree" },
  { name: "Planner", href: "/roadmap" },
  { name: "Book", href: "/dept-book" },
  { name: "Courses", href: "/courses" },
  { name: "Rooms", href: "/classrooms" },
]

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/courses") return pathname === "/courses" || pathname.startsWith("/course/")
  return pathname === href
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [userLoaded, setUserLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = res.ok ? await res.json() : { user: null }
        if (!cancelled) setUser(data.user ?? null)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setUserLoaded(true)
      }
    }
    loadUser()
    return () => {
      cancelled = true
    }
  }, [pathname])

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const links = user?.role === "admin"
    ? [...navLinks, { name: "Admin", href: "/admin" }]
    : navLinks

  const displayName = user?.profile?.displayName || user?.email || ""
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-(--bg)/80 backdrop-blur-lg supports-backdrop-filter:bg-(--bg)/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/cs_logo.png"
              alt="Computer Science Logo"
              width={40}
              height={40}
              className="rounded-full border-2 border-primary bg-white object-cover shadow-sm"
            />
            <span className="hidden bg-linear-to-r from-(--primary-color) to-(--accent-color) bg-clip-text text-lg font-bold tracking-tight text-transparent sm:inline">
              Computing Department
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
            <div className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-(--card)/60 p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {links.map((link) => {
                const isActive = isNavActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 xl:px-4 ${isActive ? "text-white" : "text-(--muted) hover:bg-(--card) hover:text-(--text)"
                      }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-(--primary-color) to-(--accent-color) shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative">{link.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />

            <div className="hidden lg:block">
              <AccountMenu
                user={user}
                userLoaded={userLoaded}
                displayName={displayName}
                initials={initials}
                onLogout={handleLogout}
              />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-lg p-2 text-(--muted) transition-colors hover:bg-(--card)/40 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-(--card) lg:hidden"
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {links.map((link) => {
                const isActive = isNavActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${isActive
                      ? "bg-linear-to-r from-(--primary-color) to-(--accent-color) text-white"
                      : "text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-border px-4 py-3">
              {userLoaded && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.profile?.avatarUrl ?? undefined} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-(--text)">{displayName}</p>
                      <p className="truncate text-xs text-(--muted)">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--muted) hover:bg-(--bg) hover:text-(--text)"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              ) : userLoaded ? (
                <Link
                  href="/auth"
                  className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-(--primary-color) to-(--accent-color) px-4 py-2 text-sm font-medium text-white shadow-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </Link>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

function AccountMenu({
  user,
  userLoaded,
  displayName,
  initials,
  onLogout,
}: {
  user: CurrentUser | null
  userLoaded: boolean
  displayName: string
  initials: string
  onLogout: () => void
}) {
  if (!userLoaded) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-(--card)/60" />
  }

  if (!user) {
    return (
      <Button asChild size="sm" className="rounded-full">
        <Link href="/auth">
          <LogIn className="h-4 w-4" />
          Sign In
        </Link>
      </Button>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors hover:border-border hover:bg-(--card)/60"
          aria-label="Account menu"
        >
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={user.profile?.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-linear-to-r from-(--primary-color) to-(--accent-color) text-xs font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <LayoutDashboard /> Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

