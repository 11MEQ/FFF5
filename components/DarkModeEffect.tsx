"use client"
import { useEffect } from "react"

export default function DarkModeEffect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("darkMode") === "true"
      document.documentElement.classList.toggle("dark", isDark)
    }
  }, [])
  return null
}
