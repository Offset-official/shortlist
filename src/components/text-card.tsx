import type React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface TextCardProps {
  href: string
  text: string
  glowColor?: string
  icon?: React.ReactNode
}

export default function TextCard({ href, text, glowColor = "primary", icon }: TextCardProps) {
  const getGlowClass = () => {
    switch (glowColor) {
      case "primary":
        return "hover:shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
      case "secondary":
        return "hover:shadow-[0_0_15px_rgba(var(--color-secondary),0.5)]"
      case "tertiary":
        return "hover:shadow-[0_0_15px_rgba(var(--color-tertiary),0.5)]"
      case "tertiary-1":
        return "hover:shadow-[0_0_15px_rgba(var(--color-tertiary-1),0.5)]"
      case "tertiary-2":
        return "hover:shadow-[0_0_15px_rgba(var(--color-tertiary-2),0.5)]"
      case "foreground":
        return "hover:shadow-[0_0_15px_rgba(var(--color-foreground),0.3)]"
      default:
        return "hover:shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"
    }
  }

  return (
    <Link href={href}>
      <Card className={`h-full transition-all duration-300 hover:border-${glowColor} ${getGlowClass()}`}>
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            <span className="text-lg font-medium">{text}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
