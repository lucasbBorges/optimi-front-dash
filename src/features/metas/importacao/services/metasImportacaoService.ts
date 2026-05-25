import { api } from "@/lib/api"

import type {
  CriarMetasAvertPayload,
  EstadoBackendMetaImportacao,
  EstadoMetaImportacao,
  ImportarMetasPorItemPayload,
  MetaAvertPayloadPraca,
  MetaItemImportado,
  RateioPracaMeta,
} from "../types"

const backendStateBySelectedState: Record<
  EstadoMetaImportacao,
  EstadoBackendMetaImportacao
> = {
  RS: "RS1",
  SC: "SC1",
}

function getRateioQuantidade(item: MetaItemImportado, rateio: RateioPracaMeta) {
  return Math.ceil((item.qt * rateio.percentual) / 100)
}

function getRateioValor(item: MetaItemImportado, rateio: RateioPracaMeta) {
  return Math.ceil((item.vlr * rateio.percentual) / 100)
}

function montarMetasAvertPayload(
  payload: ImportarMetasPorItemPayload
): CriarMetasAvertPayload {
  const pracas: MetaAvertPayloadPraca[] = payload.rateios.map((rateio) => ({
    praca: rateio.praca,
    itens: payload.itensComIncremento.map((item) => ({
      codprod: item.codprod,
      qt: getRateioQuantidade(item, rateio),
      vlr: getRateioValor(item, rateio),
    })),
  }))

  return {
    supervisor: backendStateBySelectedState[payload.estado],
    ano: payload.year,
    mes: payload.month,
    pracas,
  }
}

export function montarMetasAvertPayloadParaTeste(
  payload: ImportarMetasPorItemPayload
): CriarMetasAvertPayload {
  return montarMetasAvertPayload(payload)
}

/*
Payload esperado pelo backend:
{
  supervisor: "SC1",
  ano: 2026,
  mes: 5,
  pracas: [
    {
      praca: rateio.praca,
      itens: [{ codprod: item.codprod, qt: 10, vlr: 100 }]
    }
  ]
}
*/

export async function importarMetasPorItem(payload: ImportarMetasPorItemPayload) {
  return api.post("/metas-avert", montarMetasAvertPayload(payload))
}
