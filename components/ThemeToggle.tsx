"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ModeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Only render after mount so server/client HTML match
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Render an invisible placeholder to keep layout stable
        return (
            <button
                className="relative p-2 rounded-full hover:bg-accent/10 transition-colors"
                aria-label="Toggle theme"
                disabled
            >
                <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="relative p-2 rounded-full hover:bg-accent/10 transition-colors"
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
            <Moon className="absolute top-2 left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-300" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}

