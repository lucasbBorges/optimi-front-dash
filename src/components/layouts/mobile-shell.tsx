import { Outlet, useLocation } from "react-router-dom"
import BottomNav from "@/components/bottom-nav"
import { useAuth } from "@/lib/auth"

export default function MobileShell() {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith("/login")
  const { currentUser } = useAuth()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
        {!hideNav && currentUser ? (
          <header className="flex items-center justify-end px-4 pt-4 md:px-6 lg:px-8">
            <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-2 shadow-sm">
              <p className="text-sm font-semibold leading-tight">
                {`Olá, ${currentUser.name}`}
              </p>
            </div>
          </header>
        ) : null}

        <main
          className="
            flex-1 px-4 pt-4
            pb-[calc(64px+env(safe-area-inset-bottom))]
            md:px-6 lg:px-8
          "
        >
          <div className="w-full">
            <Outlet />
          </div>
        </main>

        {!hideNav && <BottomNav />}
      </div>
    </div>
  )
}
