import { api } from "@/lib/api"

import type { ImportarMetasPorItemPayload } from "../types"

export async function importarMetasPorItem(payload: ImportarMetasPorItemPayload) {
  return api.post("/metas/importacao-itens", {
    estado: payload.estado,
    itens: payload.itens,
    itensComIncremento: payload.itensComIncremento,
    percentualIncremento: payload.percentualIncremento,
    rateios: payload.rateios,
  })
}
