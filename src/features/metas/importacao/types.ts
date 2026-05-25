export type EstadoMetaImportacao = "RS" | "SC"

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
  itens: MetaItemImportado[]
  itensComIncremento: MetaItemImportado[]
  percentualIncremento: number
  rateios: RateioPracaMeta[]
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
