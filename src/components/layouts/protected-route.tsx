import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth"

export default function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuth()
  const location = useLocation()

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <div className="rounded-2xl border border-border/70 bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Validando sessao...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
