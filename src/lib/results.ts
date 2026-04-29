import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import { api } from "@/lib/api"
import type { PublicUser } from "@/lib/auth"
import { getBillingScopeCode } from "@/lib/billing-scope"

export type DashboardCalendarType = "21" | "30"

type ApiSupplierBillingItemResponse = {
  supplierCode: number
  amount: number | string | null
}

type ApiBillingPeriodResponse = {
  type: string
  startDate: string
  endDate: string
  totalAmount: number | string | null
  suppliers: ApiSupplierBillingItemResponse[]
}

type ApiBillingResultsResponse = {
  representativeCode: string | null
  referenceDate: string
  cycle21To20: ApiBillingPeriodResponse
  calendarMonth: ApiBillingPeriodResponse
}

type ApiSupplierGoalItemResponse = {
  supplierCode: number
  supplierName: string | null
  goal: number | string | null
}

type ApiGoalPeriodResponse = {
  type: string
  startDate: string
  endDate: string
  goalYear: number
  goalMonth: number
  totalGoal: number | string | null
  suppliers: ApiSupplierGoalItemResponse[]
}

type ApiGoalsResponse = {
  representativeCode: string | null
  referenceDate: string
  cycle21To20: ApiGoalPeriodResponse
  calendarMonth: ApiGoalPeriodResponse
}

export type SupplierBillingItem = {
  supplierCode: number
  amount: number
}

export type BillingPeriod = {
  type: string
  startDate: string
  endDate: string
  totalAmount: number
  suppliers: SupplierBillingItem[]
}

export type BillingResults = {
  representativeCode: string
  referenceDate: string
  cycle21To20: BillingPeriod
  calendarMonth: BillingPeriod
}

export type SupplierGoalItem = {
  supplierCode: number
  supplierName: string
  goal: number
}

export type GoalPeriod = {
  type: string
  startDate: string
  endDate: string
  goalYear: number
  goalMonth: number
  totalGoal: number
  suppliers: SupplierGoalItem[]
}

export type GoalsResults = {
  representativeCode: string
  referenceDate: string
  cycle21To20: GoalPeriod
  calendarMonth: GoalPeriod
}

export type SupplierPerformanceItem = {
  supplierCode: number
  supplierName: string
  amount: number
  goal: number
}

export type PerformancePeriod = {
  type: string
  startDate: string
  endDate: string
  totalAmount: number
  totalGoal: number
  suppliers: SupplierPerformanceItem[]
  hasGoals: boolean
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

function normalizeBillingPeriod(period: ApiBillingPeriodResponse): BillingPeriod {
  return {
    type: period.type,
    startDate: period.startDate,
    endDate: period.endDate,
    totalAmount: toNumber(period.totalAmount),
    suppliers: (period.suppliers ?? []).map((supplier) => ({
      supplierCode: supplier.supplierCode,
      amount: toNumber(supplier.amount),
    })),
  }
}

function normalizeGoalPeriod(period: ApiGoalPeriodResponse): GoalPeriod {
  return {
    type: period.type,
    startDate: period.startDate,
    endDate: period.endDate,
    goalYear: period.goalYear,
    goalMonth: period.goalMonth,
    totalGoal: toNumber(period.totalGoal),
    suppliers: (period.suppliers ?? []).map((supplier) => ({
      supplierCode: supplier.supplierCode,
      supplierName:
        supplier.supplierName?.trim() || `Fornecedor ${supplier.supplierCode}`,
      goal: toNumber(supplier.goal),
    })),
  }
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

export function getBillingErrorMessage(error: unknown) {
  return getApiErrorMessage(error, "Nao foi possivel carregar o faturamento.")
}

export function getGoalsErrorMessage(error: unknown) {
  return getApiErrorMessage(error, "Nao foi possivel carregar as metas.")
}

export function getBillingPeriod(
  data: BillingResults | undefined,
  activeCalendar: DashboardCalendarType
) {
  if (!data) {
    return null
  }

  return activeCalendar === "21" ? data.cycle21To20 : data.calendarMonth
}

export function getGoalPeriod(
  data: GoalsResults | undefined,
  activeCalendar: DashboardCalendarType
) {
  if (!data) {
    return null
  }

  return activeCalendar === "21" ? data.cycle21To20 : data.calendarMonth
}

export function mergePerformancePeriod(
  billingPeriod: BillingPeriod | null,
  goalPeriod: GoalPeriod | null
): PerformancePeriod | null {
  if (!billingPeriod && !goalPeriod) {
    return null
  }

  const suppliersMap = new Map<number, SupplierPerformanceItem>()

  for (const supplier of goalPeriod?.suppliers ?? []) {
    suppliersMap.set(supplier.supplierCode, {
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName,
      amount: 0,
      goal: supplier.goal,
    })
  }

  for (const supplier of billingPeriod?.suppliers ?? []) {
    const current = suppliersMap.get(supplier.supplierCode)

    suppliersMap.set(supplier.supplierCode, {
      supplierCode: supplier.supplierCode,
      supplierName:
        current?.supplierName ?? `Fornecedor ${supplier.supplierCode}`,
      amount: supplier.amount,
      goal: current?.goal ?? 0,
    })
  }

  return {
    type: billingPeriod?.type ?? goalPeriod?.type ?? "CALENDAR_MONTH",
    startDate: billingPeriod?.startDate ?? goalPeriod?.startDate ?? "",
    endDate: billingPeriod?.endDate ?? goalPeriod?.endDate ?? "",
    totalAmount: billingPeriod?.totalAmount ?? 0,
    totalGoal: goalPeriod?.totalGoal ?? 0,
    suppliers: Array.from(suppliersMap.values()).sort(
      (left, right) => right.amount - left.amount || right.goal - left.goal
    ),
    hasGoals: (goalPeriod?.suppliers.length ?? 0) > 0,
  }
}

export function useBillingResults(currentUser: PublicUser | null) {
  const scopeCode = getBillingScopeCode(currentUser)
  const shouldFetchBilling =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"

  return useQuery({
    queryKey: ["results", "billing-by-supplier", currentUser?.role ?? "guest", scopeCode],
    queryFn: async () => {
      const { data } = await api.get<ApiBillingResultsResponse>(
        "/results/billing-by-supplier"
      )

      return {
        representativeCode: getBillingScopeCode(currentUser, data.representativeCode),
        referenceDate: data.referenceDate,
        cycle21To20: normalizeBillingPeriod(data.cycle21To20),
        calendarMonth: normalizeBillingPeriod(data.calendarMonth),
      } satisfies BillingResults
    },
    enabled: shouldFetchBilling && Boolean(scopeCode),
    retry: false,
    placeholderData: (previousData) => previousData,
  })
}

export function useGoalsResults(currentUser: PublicUser | null) {
  const scopeCode = getBillingScopeCode(currentUser)
  const shouldFetchGoals =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"

  return useQuery({
    queryKey: ["goals", currentUser?.role ?? "guest", scopeCode],
    queryFn: async () => {
      const { data } = await api.get<ApiGoalsResponse>("/goals")

      return {
        representativeCode: getBillingScopeCode(currentUser, data.representativeCode),
        referenceDate: data.referenceDate,
        cycle21To20: normalizeGoalPeriod(data.cycle21To20),
        calendarMonth: normalizeGoalPeriod(data.calendarMonth),
      } satisfies GoalsResults
    },
    enabled: shouldFetchGoals && Boolean(scopeCode),
    retry: false,
    placeholderData: (previousData) => previousData,
  })
}
