import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

import { api } from "@/lib/api"

type ApiMetaAvertItem = {
  praca?: string | null
  PRACA?: string | null
  ano?: number | string | null
  ANO?: number | string | null
  year?: number | string | null
  mes?: number | string | null
  MES?: number | string | null
  month?: number | string | null
  productCode?: number | string | null
  qt?: number | string | null
  QT?: number | string | null
  quantity?: number | string | null
  vlr?: number | string | null
  VLR?: number | string | null
  amount?: number | string | null
}

type ApiMetaAvertFamilyItem = ApiMetaAvertItem & {
  supervisor?: string | null
  family?: string | null
  description?: string | null
}

type ApiMetasAvertResponse =
  | ApiMetaAvertItem[]
  | {
      items?: ApiMetaAvertItem[]
      metas?: ApiMetaAvertItem[]
      data?: ApiMetaAvertItem[]
    }

type ApiMetasAvertFamilyResponse =
  | ApiMetaAvertFamilyItem[]
  | {
      items?: ApiMetaAvertFamilyItem[]
      metas?: ApiMetaAvertFamilyItem[]
      data?: ApiMetaAvertFamilyItem[]
    }

type ApiAvertItemSalesItem = {
  productCode?: number | string | null
  totalAmount?: number | string | null
  distinctCustomerCount?: number | string | null
}

type ApiAvertItemSalesResponse =
  | ApiAvertItemSalesItem[]
  | {
      items?: ApiAvertItemSalesItem[]
      data?: ApiAvertItemSalesItem[]
    }

export type MetaAvertItem = {
  praca: string
  ano: number
  mes: number
  qt: number
  vlr: number
}

export type MetaAvertGroup = {
  key: string
  ano: number
  mes: number
  qt: number
  vlr: number
  totalItens: number
  totalPracas: number
  pracas: string[]
}

export type MetaAvertFamilyItem = {
  praca: string
  supervisor: string
  ano: number
  mes: number
  productCode: number
  quantity: number
  amount: number
  family: string
  description: string
}

export type MetaAvertFamilyProduct = {
  productCode: number
  description: string
  quantity: number
  amount: number
}

export type MetaAvertFamilyGroup = {
  family: string
  products: MetaAvertFamilyProduct[]
  quantity: number
  amount: number
}

export type AvertItemSalesItem = {
  productCode: number
  totalAmount: number
  distinctCustomerCount: number
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === "string") {
    const normalizedValue = value.replace(",", ".")
    const parsedValue = Number(normalizedValue)

    return Number.isFinite(parsedValue) ? parsedValue : 0
  }

  return 0
}

function getItemsFromResponse(response: ApiMetasAvertResponse) {
  if (Array.isArray(response)) {
    return response
  }

  return response.items ?? response.metas ?? response.data ?? []
}

function getFamilyItemsFromResponse(response: ApiMetasAvertFamilyResponse) {
  if (Array.isArray(response)) {
    return response
  }

  return response.items ?? response.metas ?? response.data ?? []
}

function getSalesItemsFromResponse(response: ApiAvertItemSalesResponse) {
  if (Array.isArray(response)) {
    return response
  }

  return response.items ?? response.data ?? []
}

function normalizeMetaAvertItem(item: ApiMetaAvertItem): MetaAvertItem {
  const praca = item.praca ?? item.PRACA

  return {
    praca: praca?.trim() || "Sem praca",
    ano: toNumber(item.year ?? item.ano ?? item.ANO),
    mes: toNumber(item.month ?? item.mes ?? item.MES),
    qt: toNumber(item.quantity ?? item.qt ?? item.QT),
    vlr: toNumber(item.amount ?? item.vlr ?? item.VLR),
  }
}

function normalizeMetaAvertFamilyItem(
  item: ApiMetaAvertFamilyItem
): MetaAvertFamilyItem {
  const praca = item.praca ?? item.PRACA
  const productCode = toNumber(item.productCode)
  const family = item.family?.trim() || "Sem familia"

  return {
    praca: praca?.trim() || "Sem praca",
    supervisor: item.supervisor?.trim() || "",
    ano: toNumber(item.year ?? item.ano ?? item.ANO),
    mes: toNumber(item.month ?? item.mes ?? item.MES),
    productCode,
    quantity: toNumber(item.quantity ?? item.qt ?? item.QT),
    amount: toNumber(item.amount ?? item.vlr ?? item.VLR),
    family,
    description: item.description?.trim() || `Produto ${productCode}`,
  }
}

function normalizeAvertItemSalesItem(
  item: ApiAvertItemSalesItem
): AvertItemSalesItem {
  return {
    productCode: toNumber(item.productCode),
    totalAmount: toNumber(item.totalAmount),
    distinctCustomerCount: toNumber(item.distinctCustomerCount),
  }
}

export function groupMetasAvert(items: MetaAvertItem[]): MetaAvertGroup[] {
  const groupsMap = new Map<string, MetaAvertGroup>()

  for (const item of items) {
    const key = `${item.ano}-${item.mes}`
    const currentGroup = groupsMap.get(key)

    if (currentGroup) {
      const pracas = currentGroup.pracas.includes(item.praca)
        ? currentGroup.pracas
        : [...currentGroup.pracas, item.praca].sort((left, right) =>
            left.localeCompare(right, "pt-BR")
          )

      groupsMap.set(key, {
        ...currentGroup,
        qt: currentGroup.qt + item.qt,
        vlr: currentGroup.vlr + item.vlr,
        totalItens: currentGroup.totalItens + 1,
        totalPracas: pracas.length,
        pracas,
      })
      continue
    }

    groupsMap.set(key, {
      key,
      ano: item.ano,
      mes: item.mes,
      qt: item.qt,
      vlr: item.vlr,
      totalItens: 1,
      totalPracas: 1,
      pracas: [item.praca],
    })
  }

  return Array.from(groupsMap.values()).sort((left, right) => {
    return right.ano - left.ano || right.mes - left.mes
  })
}

export function groupMetasAvertByFamily(
  items: MetaAvertFamilyItem[]
): MetaAvertFamilyGroup[] {
  const familyMap = new Map<string, Map<number, MetaAvertFamilyProduct>>()

  for (const item of items) {
    const productsMap = familyMap.get(item.family) ?? new Map()
    const currentProduct = productsMap.get(item.productCode)

    productsMap.set(item.productCode, {
      productCode: item.productCode,
      description: currentProduct?.description ?? item.description,
      quantity: (currentProduct?.quantity ?? 0) + item.quantity,
      amount: (currentProduct?.amount ?? 0) + item.amount,
    })
    familyMap.set(item.family, productsMap)
  }

  return Array.from(familyMap.entries())
    .map(([family, productsMap]) => {
      const products = Array.from(productsMap.values()).sort(
        (left, right) =>
          right.amount - left.amount ||
          left.description.localeCompare(right.description, "pt-BR")
      )

      return {
        family,
        products,
        quantity: products.reduce((total, product) => total + product.quantity, 0),
        amount: products.reduce((total, product) => total + product.amount, 0),
      }
    })
    .sort(
      (left, right) =>
        right.amount - left.amount ||
        left.family.localeCompare(right.family, "pt-BR")
    )
}

export function getMetasAvertErrorMessage(error: unknown) {
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

  return "Nao foi possivel carregar as metas Avert."
}

export function getAvertSalesErrorMessage(error: unknown) {
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

  return "Nao foi possivel carregar o faturado Avert."
}

export function useMetasAvert() {
  return useQuery({
    queryKey: ["metas-avert"],
    queryFn: async () => {
      const { data } = await api.get<ApiMetasAvertResponse>("/metas-avert")
      const items = getItemsFromResponse(data).map(normalizeMetaAvertItem)

      return {
        items,
        groups: groupMetasAvert(items),
      }
    },
    retry: false,
  })
}

export function useMetasAvertFamilies({
  enabled,
  ano,
  mes,
  scopeKey,
}: {
  enabled: boolean
  ano: number | null
  mes: number | null
  scopeKey: string
}) {
  return useQuery({
    queryKey: ["metas-avert", "familias", scopeKey, ano, mes],
    queryFn: async () => {
      const { data } = await api.get<ApiMetasAvertFamilyResponse>(
        "/metas-avert/familias",
        {
          params:
            ano && mes
              ? {
                  ano,
                  mes,
                }
              : undefined,
        }
      )
      const items = getFamilyItemsFromResponse(data).map(
        normalizeMetaAvertFamilyItem
      )

      return {
        items,
        families: groupMetasAvertByFamily(items),
      }
    },
    enabled,
    retry: false,
  })
}

export function useAvertItemSales({
  enabled,
  startDate,
  endDate,
  scopeKey,
}: {
  enabled: boolean
  startDate: string
  endDate: string
  scopeKey: string
}) {
  return useQuery({
    queryKey: ["vendas-avert", "itens", scopeKey, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiAvertItemSalesResponse>(
        "/vendas-avert/itens",
        {
          params: {
            startDate,
            endDate,
          },
        }
      )

      return getSalesItemsFromResponse(data).map(normalizeAvertItemSalesItem)
    },
    enabled,
    retry: false,
  })
}

export function useDeleteMetasAvert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ano, mes }: { ano: number; mes: number }) => {
      await api.delete("/metas-avert", {
        params: {
          ano,
          mes,
        },
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["metas-avert"] })
    },
  })
}
