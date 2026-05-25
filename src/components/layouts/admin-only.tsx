import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth"

export default function AdminOnly() {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return null
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
