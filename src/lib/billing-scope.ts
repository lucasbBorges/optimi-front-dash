import type { PublicUser } from "@/lib/auth"

export function getSupervisorBillingCode(supervisorState: string | null | undefined) {
  const normalizedState = supervisorState?.trim().toUpperCase()

  switch (normalizedState) {
    case "RS":
      return "RS1"
    case "SC":
      return "SC1"
    case "TO":
      return "TO"
    default:
      return ""
  }
}

export function getBillingScopeCode(
  currentUser: PublicUser | null,
  apiScopeCode?: string | null
) {
  const normalizedApiScopeCode = apiScopeCode?.trim() ?? ""

  if (normalizedApiScopeCode) {
    return normalizedApiScopeCode
  }

  if (!currentUser) {
    return ""
  }

  if (currentUser.role === "supervisor") {
    return getSupervisorBillingCode(currentUser.supervisorState)
  }

  if (currentUser.role === "representante") {
    return currentUser.representativeCode?.trim() ?? ""
  }

  if (currentUser.role === "admin") {
    return "EMPRESA"
  }

  return ""
}

export function getBillingScopeLabel(
  currentUser: PublicUser | null,
  apiScopeCode?: string | null
) {
  const scopeCode = getBillingScopeCode(currentUser, apiScopeCode)

  if (!scopeCode || !currentUser) {
    return null
  }

  if (currentUser.role === "supervisor") {
    return `Supervisor ${scopeCode}`
  }

  if (currentUser.role === "representante") {
    return `Representante ${scopeCode}`
  }

  if (currentUser.role === "admin") {
    return "Empresa"
  }

  return null
}
