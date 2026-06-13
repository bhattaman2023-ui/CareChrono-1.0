"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

type Theme = "light" | "dark"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  const savedTheme = window.localStorage.getItem("carechrono-theme")
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme())
  const isDark = theme === "dark"

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem("carechrono-theme", theme)
  }, [isDark, theme])

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="fixed bottom-5 left-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white/90 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:scale-105 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-black/30"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
