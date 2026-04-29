import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

import { api } from "@/lib/api"
import {
  clearStoredToken,
  decodeJwtPayload,
  getTokenExpiresAt,
  getStoredToken,
  isTokenExpired,
  setStoredToken,
} from "@/lib/auth-token"

export type UserRole = "representante" | "supervisor" | "admin"
export type SupervisorState = "RS" | "SC" | "TO"

export type PublicUser = {
  id: string
  name: string
  email: string
  role: UserRole
  active: boolean
  representativeCode: string | null
  supervisorState: SupervisorState | null
}

type ApiUser = {
  id: number | string
  email: string
  name: string | null
  role: string
  representativeCode: string | null
  supervisorState: string | null
  active: boolean
}

type CreateUserInput = {
  name: string
  email: string
  password: string
  role: UserRole
  representativeCode?: string
  supervisorState?: SupervisorState
}

type CreateUserRequest = {
  email: string
  name: string
  password: string
  role: "ADMIN" | "REPRESENTANTE" | "SUPERVISOR"
  representativeCode: string | null
  supervisorState: SupervisorState | null
  active: boolean
}

type LoginInput = {
  email: string
  password: string
}

type LoginResponse = {
  tokenType: string
  accessToken: string
  expiresAt: string
  user: ApiUser
}

type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

type UsersPagination = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  isLoading: boolean
}

type AuthContextValue = {
  currentUser: PublicUser | null
  users: PublicUser[]
  usersPagination: UsersPagination
  isAuthenticated: boolean
  isCheckingAuth: boolean
  isLoggingIn: boolean
  setUsersPage: (page: number) => void
  login: (input: LoginInput) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  createUser: (input: CreateUserInput) => Promise<{ success: boolean; message?: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; message?: string }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function normalizeRole(role: string): UserRole {
  const normalized = role.toLowerCase()

  if (normalized === "admin" || normalized === "supervisor") {
    return normalized
  }

  return "representante"
}

function normalizeSupervisorState(value: string | null): SupervisorState | null {
  if (value === "RS" || value === "SC" || value === "TO") {
    return value
  }

  return null
}

function normalizeApiUser(user: ApiUser): PublicUser {
  const role = normalizeRole(user.role)
  const baseUser = {
    id: String(user.id),
    name: user.name?.trim() || user.email.split("@")[0],
    email: user.email,
    role,
    active: user.active,
  }

  if (role === "representante") {
    return {
      ...baseUser,
      role,
      representativeCode: user.representativeCode ?? "",
      supervisorState: null,
    }
  }

  if (role === "supervisor") {
    return {
      ...baseUser,
      role,
      representativeCode: user.representativeCode ?? "",
      supervisorState: normalizeSupervisorState(user.supervisorState) ?? "RS",
    }
  }

  return {
    ...baseUser,
    role,
    representativeCode: null,
    supervisorState: null,
  }
}

function normalizeTokenUser(token: string): PublicUser | null {
  const payload = decodeJwtPayload(token)

  if (!payload?.email || !payload.name || !payload.role || !payload.userId) {
    return null
  }

  return normalizeApiUser({
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    representativeCode: payload.representativeCode ?? null,
    supervisorState: payload.supervisorState ?? null,
    active: payload.active ?? true,
  } as ApiUser)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "message" in responseData &&
        typeof responseData.message === "string"
    ) {
      return responseData.message
    }

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "detail" in responseData &&
      typeof responseData.detail === "string"
    ) {
      return responseData.detail
    }

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "error" in responseData &&
      typeof responseData.error === "string"
    ) {
      return responseData.error
    }

    if (error.response?.status === 401) {
      return "Sessao expirada ou credenciais invalidas."
    }

    if (error.response?.status === 403) {
      return "Apenas administradores podem realizar esta acao."
    }
  }

  return fallback
}

function toCreateUserRequest(input: CreateUserInput): CreateUserRequest {
  return {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    password: input.password,
    role:
      input.role === "admin"
        ? "ADMIN"
        : input.role === "supervisor"
          ? "SUPERVISOR"
          : "REPRESENTANTE",
    representativeCode: input.role === "representante" ? input.representativeCode?.trim() || null : null,
    supervisorState: input.role === "supervisor" ? input.supervisorState ?? null : null,
    active: true,
  }
}

export function getUserScopeLabel(user: PublicUser | null) {
  if (!user) {
    return "Resultado indisponivel"
  }

  if (user.role === "representante") {
    return `Praça do representante ${user.representativeCode}`
  }

  if (user.role === "supervisor") {
    return `Estado ${user.supervisorState}`
  }

  return "Empresa"
}

export function getUserResultLabel(user: PublicUser | null) {
  if (!user) {
    return "resultado indisponivel"
  }

  if (user.role === "representante") {
    return "faturado da praça"
  }

  if (user.role === "supervisor") {
    return "faturado do estado"
  }

  return "resultado da empresa"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [usersPage, setUsersPage] = useState(0)
  const usersPageSize = 20
  const [token, setToken] = useState(() => {
    const storedToken = getStoredToken()

    if (!storedToken || isTokenExpired(storedToken)) {
      clearStoredToken()
      return null
    }

    return storedToken
  })
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(() =>
    token ? normalizeTokenUser(token) : null
  )

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await api.get<ApiUser>("/auth/me")
      return normalizeApiUser(data)
    },
    enabled: Boolean(token),
    retry: false,
  })

  const usersQuery = useQuery({
    queryKey: ["users", usersPage, usersPageSize],
    queryFn: async () => {
      const { data } = await api.get<PageResponse<ApiUser>>("/users", {
        params: {
          page: usersPage,
          size: usersPageSize,
        },
      })

      return {
        ...data,
        content: data.content.map(normalizeApiUser),
      }
    },
    enabled: Boolean(currentUser && currentUser.role === "admin"),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post<LoginResponse>("/auth/login", input)
      return data
    },
  })

  const createUserMutation = useMutation({
    mutationFn: async (input: CreateUserInput) => {
      await api.post("/users", toCreateUserRequest(input))
    },
    onSuccess: async () => {
      setUsersPage(0)
      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await queryClient.refetchQueries({
        queryKey: ["users"],
        type: "active",
      })
    },
  })

  useEffect(() => {
    if (meQuery.data) {
      setCurrentUser(meQuery.data)
    }
  }, [meQuery.data])

  useEffect(() => {
    if (meQuery.isError) {
      clearStoredToken()
      setToken(null)
      setCurrentUser(null)
      queryClient.removeQueries({ queryKey: ["auth"] })
    }
  }, [meQuery.isError, queryClient])

  useEffect(() => {
    function handleUnauthorized() {
      clearStoredToken()
      setToken(null)
      setCurrentUser(null)
      queryClient.clear()
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [queryClient])

  useEffect(() => {
    if (!token) {
      return
    }

    const expiresAt = getTokenExpiresAt(token)

    if (!expiresAt) {
      clearStoredToken()
      setToken(null)
      setCurrentUser(null)
      return
    }

    const timeout = window.setTimeout(() => {
      clearStoredToken()
      setToken(null)
      setCurrentUser(null)
      queryClient.clear()
    }, Math.max(expiresAt - Date.now(), 0))

    return () => window.clearTimeout(timeout)
  }, [queryClient, token])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      users: usersQuery.data?.content ?? [],
      usersPagination: {
        page: usersQuery.data?.page ?? usersPage,
        size: usersQuery.data?.size ?? usersPageSize,
        totalElements: usersQuery.data?.totalElements ?? 0,
        totalPages: usersQuery.data?.totalPages ?? 0,
        first: usersQuery.data?.first ?? true,
        last: usersQuery.data?.last ?? true,
        isLoading: usersQuery.isLoading,
      },
      isAuthenticated: Boolean(token && currentUser),
      isCheckingAuth: Boolean(token && meQuery.isLoading),
      isLoggingIn: loginMutation.isPending,
      setUsersPage: (page) => setUsersPage(Math.max(page, 0)),
      login: async (input) => {
        try {
          const response = await loginMutation.mutateAsync(input)
          setStoredToken(response.accessToken)
          setToken(response.accessToken)
          setCurrentUser(normalizeApiUser(response.user))
          await queryClient.invalidateQueries({ queryKey: ["auth", "me"] })

          return { success: true }
        } catch (error) {
          clearStoredToken()
          setToken(null)
          setCurrentUser(null)

          return {
            success: false,
            message: getErrorMessage(error, "Nao foi possivel entrar."),
          }
        }
      },
      logout: () => {
        clearStoredToken()
        setToken(null)
        setCurrentUser(null)
        queryClient.clear()
      },
      createUser: async (input) => {
        if (currentUser?.role !== "admin") {
          return {
            success: false,
            message: "Apenas administradores podem cadastrar usuarios.",
          }
        }

        if (
          input.role === "representante" &&
          !input.representativeCode?.trim()
        ) {
          return {
            success: false,
            message: "Informe o codigo do representante.",
          }
        }

        try {
          await createUserMutation.mutateAsync(input)

          return { success: true }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 409) {
            return {
              success: false,
              message: "Esse representante ja foi cadastrado.",
            }
          }

          return {
            success: false,
            message: getErrorMessage(
              error,
              "Nao foi possivel cadastrar o usuario pela API."
            ),
          }
        }
      },
      deleteUser: async (userId) => {
        try {
          await api.delete(`/users/${userId}`)
          await queryClient.invalidateQueries({ queryKey: ["users"] })

          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: getErrorMessage(
              error,
              "Nao foi possivel excluir o usuario pela API."
            ),
          }
        }
      },
    }),
    [
      currentUser,
      createUserMutation,
      loginMutation,
      meQuery.isLoading,
      queryClient,
      token,
      usersQuery.data,
      usersQuery.isLoading,
      usersPage,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
