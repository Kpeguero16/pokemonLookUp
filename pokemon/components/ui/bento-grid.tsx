"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

interface BentoGridItemProps {
  className?: string
  children: React.ReactNode
  variant?: "default" | "accent" | "muted"
}

export function BentoGrid({ className, children, style }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-4 p-4",
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}

export function BentoGridItem({
  className,
  children,
  variant = "default",
}: BentoGridItemProps) {
  const variantClasses = {
    default: "bg-gradient-to-br from-white/20 to-transparent border border-white/20",
    accent: "bg-gradient-to-br from-white/20 to-transparent border border-white/20",
    muted: "bg-gradient-to-br from-white/20 to-transparent border border-white/20",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-6 transition-all duration-300",
        "hover:scale-[1.02]",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
