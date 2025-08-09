"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps {
  className?: string
  children: React.ReactNode
}

interface BentoGridItemProps {
  className?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "accent" | "muted"
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4",
        className
      )}
    >
      {children}
    </div>
  )
}

export function BentoGridItem({
  className,
  children,
  size = "md",
  variant = "default",
}: BentoGridItemProps) {
  const sizeClasses = {
    sm: "col-span-1 row-span-1",
    md: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    lg: "col-span-1 row-span-1 md:col-span-2 md:row-span-1",
    xl: "col-span-1 row-span-1 md:col-span-2 md:row-span-2",
  }

  const variantClasses = {
    default: "bg-background border border-border",
    accent: "bg-accent border border-accent-foreground/20",
    muted: "bg-muted border border-muted-foreground/20",
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:shadow-lg",
        "hover:scale-[1.02] hover:border-border/50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <div className="relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  )
}
