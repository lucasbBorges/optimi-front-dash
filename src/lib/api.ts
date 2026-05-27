import axios from "axios"

import { clearStoredToken, getStoredToken, isTokenExpired } from "@/lib/auth-token"

const defaultApiUrl = `${window.location.protocol}//${window.location.hostname}:8081`

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
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
