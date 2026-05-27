import { NavLink } from "react-router-dom"
import { BarChart3, Boxes, Home, Settings, Target } from "lucide-react"

import { useAuth } from "@/lib/auth"

type Item = {
  to: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const baseItems: Item[] = [
  { to: "/",        label: "Home",      icon: Home },
  { to: "/avert",   label: "Avert",     icon: Boxes },
  { to: "/analise",  label: "Análise", icon: BarChart3 },
]

const adminItems: Item[] = [
  { to: "/metas", label: "Metas", icon: Target },
]

const configItem: Item = { to: "/config", label: "Config", icon: Settings }

export default function BottomNav() {
  const { currentUser } = useAuth()
  const items =
    currentUser?.role === "admin"
      ? [...baseItems, ...adminItems, configItem]
      : [...baseItems, configItem]

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-50
        bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80
        border-t border-border
        safe-area-bottom
      "
      style={
        { 
          "--nav-h": "64px" 
        } as React.CSSProperties
      }
    >
      <div
        className="mx-auto grid h-[var(--nav-h)] w-full max-w-6xl px-2 md:px-4 lg:px-6"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center gap-1 select-none",
                "text-[11px] sm:text-xs",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")
            }
          >
            <Icon className="size-5" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      {/* reservamos a área do indicador do iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
