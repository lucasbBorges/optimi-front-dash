import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { api } from "@/lib/api"
import type { PublicUser } from "@/lib/auth"
import { getBillingScopeCode } from "@/lib/billing-scope"

type ApiTopCustomerItemResponse = {
  customerCode: number | string
  customerName: string | null
  amount: number | string | null
}

type ApiTopCustomersResponse = {
  representativeCode: string | null
  referenceDate: string
  startDate: string
  endDate: string
  customers: ApiTopCustomerItemResponse[]
}

export type TopCustomerItem = {
  customerCode: number
  customerName: string
  amount: number
}

export type TopCustomersResults = {
  representativeCode: string
  referenceDate: string
  startDate: string
  endDate: string
  customers: TopCustomerItem[]
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const normalized = Number(value)
    return Number.isFinite(normalized) ? normalized : 0
  }

  return 0
}

function getApiErrorMessage(error: unknown, fallback: string) {
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
  }

  return fallback
}

export function getTopCustomersErrorMessage(error: unknown) {
  return getApiErrorMessage(error, "Nao foi possivel carregar os top clientes.")
}

export function useTopCustomers(currentUser: PublicUser | null) {
  const scopeCode = getBillingScopeCode(currentUser)
  const shouldFetchTopCustomers =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"

  return useQuery({
    queryKey: ["top-customers", currentUser?.role ?? "guest", scopeCode],
    queryFn: async () => {
      const { data } = await api.get<ApiTopCustomersResponse>("/top-customers")

      return {
        representativeCode: getBillingScopeCode(currentUser, data.representativeCode),
        referenceDate: data.referenceDate,
        startDate: data.startDate,
        endDate: data.endDate,
        customers: (data.customers ?? []).map((customer) => ({
          customerCode: toNumber(customer.customerCode),
          customerName:
            customer.customerName?.trim() || `Cliente ${customer.customerCode}`,
          amount: toNumber(customer.amount),
        })),
      } satisfies TopCustomersResults
    },
    enabled: shouldFetchTopCustomers && Boolean(scopeCode),
    retry: false,
    placeholderData: (previousData) => previousData,
  })
}
