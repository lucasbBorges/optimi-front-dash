import { useQuery } from "@tanstack/react-query"
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

type ApiMetasAvertResponse =
  | ApiMetaAvertItem[]
  | {
      items?: ApiMetaAvertItem[]
      metas?: ApiMetaAvertItem[]
      data?: ApiMetaAvertItem[]
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
