import axios from "axios"

import { clearStoredToken, getStoredToken, isTokenExpired } from "@/lib/auth-token"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api",
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    if (isTokenExpired(token)) {
      clearStoredToken()
      window.dispatchEvent(new Event("auth:unauthorized"))
      return config
    }

    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredToken()
      window.dispatchEvent(new Event("auth:unauthorized"))
    }

    return Promise.reject(error)
  }
)
