import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { RoadmapProvider } from "@/context/roadmap-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Department Portal",
  description: "Computer Science Department Portal",
  generator: "v0.app",
}

const themeInitializationScript = `(() => {
  const storageKey = 'dept-theme';
  const classList = document.documentElement.classList;
  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : prefersDark ? 'dark' : 'light';
    classList.remove('light', 'dark');
    classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    classList.add('light');
    document.documentElement.style.colorScheme = 'light';
  }
})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Script id="theme-script" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
        <ThemeProvider>
          <RoadmapProvider>
            <Navbar />
            {children}
            <Footer />
          </RoadmapProvider>
          <Analytics />
          <Toaster /> {/* This is the engine that actually renders the message */}
        </ThemeProvider>
      </body>
    </html>
  )
}

