export type EstadoMetaImportacao = "RS" | "SC"

export type EstadoBackendMetaImportacao = "RS1" | "SC1"

export type MetaItemImportado = {
  codprod: number
  qt: number
  vlr: number
}

export type RateioPracaMeta = {
  praca: string
  percentual: number
}

export type ImportarMetasPorItemPayload = {
  estado: EstadoMetaImportacao
  year: number
  month: number
  itens: MetaItemImportado[]
  itensComIncremento: MetaItemImportado[]
  percentualIncremento: number
  rateios: RateioPracaMeta[]
}

export type MetaAvertPayloadItem = {
  codprod: number
  qt: number
  vlr: number
}

export type MetaAvertPayloadPraca = {
  praca: string
  itens: MetaAvertPayloadItem[]
}

export type CriarMetasAvertPayload = {
  supervisor: EstadoBackendMetaImportacao
  ano: number
  mes: number
  pracas: MetaAvertPayloadPraca[]
}

export type ErroImportacaoMeta = {
  linha: number
  campo?: "codprod" | "qt" | "vlr"
  mensagem: string
}

export type ResumoImportacaoMetas = {
  totalItens: number
  totalQuantidade: number
  totalValor: number
}
