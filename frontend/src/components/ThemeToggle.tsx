"use client"

import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun } from "lucide-react"
import { usePathname } from "next/navigation"

type ThemeToggleProps = {
  variant?: "inline" | "floating"
}

export default function ThemeToggle({ variant = "inline" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  // Prevent double rendering of the toggle on the landing page
  if (variant === "floating" && pathname === "/") {
    return null
  }

  const isDark = theme === "dark"
  const nextThemeLabel = isDark ? "Light" : "Dark"
  
  const buttonStyle =
    variant === "floating"
      ? {
          position: "fixed" as const,
          top: "118px",
          right: "24px",
          zIndex: 2147483647,
        }
      : undefined

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        ...buttonStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        minWidth: "104px",
        height: "44px",
        padding: "0 16px",
        borderRadius: "9999px",
        border: isDark ? "1px solid rgba(51, 65, 85, 0.9)" : "1px solid rgba(14, 165, 233, 0.45)",
        background: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
        color: isDark ? "#f8fafc" : "#0f172a",
        boxShadow: isDark ? "0 18px 40px rgba(0, 0, 0, 0.38)" : "0 18px 40px rgba(2, 132, 199, 0.18)",
        backdropFilter: "blur(14px)",
        fontSize: "14px",
        fontWeight: 800,
        lineHeight: 1,
        cursor: "pointer",
      }}
      className="transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      {isDark ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5 text-sky-600" />}
      <span>{nextThemeLabel}</span>
    </button>
  )
}
