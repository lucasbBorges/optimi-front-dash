const AUTH_TOKEN_KEY = "optimi-rca-access-token"

type JwtPayload = {
  exp?: number
  name?: string
  email?: string
  role?: string
  userId?: number
  representativeCode?: string | null
  supervisorState?: string | null
  active?: boolean
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")

  return atob(padded)
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split(".")

  if (!payload) {
    return null
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string) {
  const payload = decodeJwtPayload(token)

  if (!payload?.exp) {
    return true
  }

  return payload.exp * 1000 <= Date.now()
}

export function getTokenExpiresAt(token: string) {
  const payload = decodeJwtPayload(token)

  return payload?.exp ? payload.exp * 1000 : null
}
