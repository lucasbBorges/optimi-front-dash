import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { api } from "@/lib/api"
import type { PublicUser } from "@/lib/auth"
import { getBillingScopeCode } from "@/lib/billing-scope"

type ApiPotentialCustomerItemResponse = {
  customerCode: number | string
  customerName: string | null
  difference: number | string | null
}

type ApiPotentialCustomersResponse = {
  representativeCode: string | null
  referenceDate: string
  previousPeriodStartDate: string
  previousPeriodEndDate: string
  currentPeriodStartDate: string
  currentPeriodEndDate: string
  customers: ApiPotentialCustomerItemResponse[]
}

export type PotentialCustomerItem = {
  customerCode: number
  customerName: string
  difference: number
}

export type PotentialCustomersResults = {
  representativeCode: string
  referenceDate: string
  previousPeriodStartDate: string
  previousPeriodEndDate: string
  currentPeriodStartDate: string
  currentPeriodEndDate: string
  customers: PotentialCustomerItem[]
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

export function getPotentialCustomersErrorMessage(error: unknown) {
  return getApiErrorMessage(
    error,
    "Nao foi possivel carregar os clientes em potencial."
  )
}

export function usePotentialCustomers(currentUser: PublicUser | null) {
  const scopeCode = getBillingScopeCode(currentUser)
  const shouldFetchPotentialCustomers =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"

  return useQuery({
    queryKey: ["potential-customers", currentUser?.role ?? "guest", scopeCode],
    queryFn: async () => {
      const { data } = await api.get<ApiPotentialCustomersResponse>(
        "/potential-customers"
      )

      return {
        representativeCode: getBillingScopeCode(currentUser, data.representativeCode),
        referenceDate: data.referenceDate,
        previousPeriodStartDate: data.previousPeriodStartDate,
        previousPeriodEndDate: data.previousPeriodEndDate,
        currentPeriodStartDate: data.currentPeriodStartDate,
        currentPeriodEndDate: data.currentPeriodEndDate,
        customers: (data.customers ?? []).map((customer) => ({
          customerCode: toNumber(customer.customerCode),
          customerName:
            customer.customerName?.trim() || `Cliente ${customer.customerCode}`,
          difference: toNumber(customer.difference),
        })),
      } satisfies PotentialCustomersResults
    },
    enabled: shouldFetchPotentialCustomers && Boolean(scopeCode),
    retry: false,
    placeholderData: (previousData) => previousData,
  })
}
