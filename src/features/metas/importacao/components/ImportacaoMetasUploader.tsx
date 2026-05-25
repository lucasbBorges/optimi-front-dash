import { useMemo, useRef, useState } from "react"
import axios from "axios"
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  MapPinned,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  calcularResumoMetas,
  gerarModeloImportacaoMetas,
  lerArquivoMetas,
  validarMetasImportadas,
} from "../utils/metasExcel"
import { useImportarMetas } from "../hooks/useImportarMetas"
import type {
  ErroImportacaoMeta,
  EstadoMetaImportacao,
  MetaItemImportado,
  RateioPracaMeta,
} from "../types"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatInteger(value: number) {
  return integerFormatter.format(value)
}

function getImportErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

    if (
      typeof responseData === "object" &&
      responseData !== null &&
      "detail" in responseData &&
      typeof responseData.detail === "string"
    ) {
      return responseData.detail
    }

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
      "error" in responseData &&
      typeof responseData.error === "string"
    ) {
      return responseData.error
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Nao foi possivel enviar a importacao."
}

const pracasPorEstado: Record<EstadoMetaImportacao, string[]> = {
  RS: ["BENTO", "CAXIAS1", "MISSOES1", "PASSOFUNDO", "SANTAMARIA"],
  SC: [
    "ALTOVALE",
    "BLUMENAU",
    "FLORIPAILHA",
    "FLORIPACONTINENTE",
    "FLORIPA3",
    "ITAJAI1",
    "ITAJAI2",
    "JOINVILLE",
    "SULDOESTADO",
  ],
}

function getPercentualTotal(rateios: RateioPracaMeta[]) {
  return rateios.reduce((total, item) => total + item.percentual, 0)
}

function getRateioValor(item: MetaItemImportado, percentual: number) {
  return Math.ceil((item.vlr * percentual) / 100)
}

function getRateioQuantidade(item: MetaItemImportado, percentual: number) {
  return Math.ceil((item.qt * percentual) / 100)
}

function getRateioValorTotal(
  itens: MetaItemImportado[],
  percentual: number
) {
  return itens.reduce(
    (total, item) => total + getRateioValor(item, percentual),
    0
  )
}

function getRateioQuantidadeTotal(
  itens: MetaItemImportado[],
  percentual: number
) {
  return itens.reduce(
    (total, item) => total + getRateioQuantidade(item, percentual),
    0
  )
}

function aplicarIncremento(
  dados: MetaItemImportado[],
  percentualIncremento: number
) {
  const multiplier = 1 + percentualIncremento / 100

  return dados.map((item) => ({
    ...item,
    qt: Math.ceil(item.qt * multiplier),
    vlr: Math.ceil(item.vlr * multiplier * 100) / 100,
  }))
}

export function ImportacaoMetasUploader({
  estado,
  year,
  month,
  onImportedDataChange,
  onImportSuccess,
  onNotify,
}: {
  estado: EstadoMetaImportacao
  year: number
  month: number
  onImportedDataChange: (hasData: boolean) => void
  onImportSuccess: () => void
  onNotify: (notification: {
    type: "success" | "error"
    title: string
    message: string
  }) => void
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState("")
  const [dados, setDados] = useState<MetaItemImportado[]>([])
  const [erros, setErros] = useState<ErroImportacaoMeta[]>([])
  const [feedback, setFeedback] = useState("")
  const [rateios, setRateios] = useState<RateioPracaMeta[]>([])
  const [selectedPraca, setSelectedPraca] = useState("")
  const [selectedPercentual, setSelectedPercentual] = useState("")
  const [incrementoDraft, setIncrementoDraft] = useState("0")
  const [incrementoAplicado, setIncrementoAplicado] = useState(0)
  const [incrementoError, setIncrementoError] = useState("")
  const [rateioError, setRateioError] = useState("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  )
  const importarMetasMutation = useImportarMetas()

  const incrementoEstimado = /^\d+$/.test(incrementoDraft)
    ? Number(incrementoDraft)
    : 0
  const dadosComIncremento = useMemo(
    () => aplicarIncremento(dados, incrementoAplicado),
    [dados, incrementoAplicado]
  )
  const dadosEstimados = useMemo(
    () => aplicarIncremento(dados, incrementoEstimado),
    [dados, incrementoEstimado]
  )
  const resumoOriginal = useMemo(() => calcularResumoMetas(dados), [dados])
  const resumoEstimado = useMemo(
    () => calcularResumoMetas(dadosEstimados),
    [dadosEstimados]
  )
  const resumo = useMemo(
    () => calcularResumoMetas(dadosComIncremento),
    [dadosComIncremento]
  )
  const percentualTotal = useMemo(() => getPercentualTotal(rateios), [rateios])
  const availablePracas = pracasPorEstado[estado].filter(
    (praca) => !rateios.some((rateio) => rateio.praca === praca)
  )
  const canSubmit =
    dados.length > 0 &&
    erros.length === 0 &&
    percentualTotal === 100 &&
    !importarMetasMutation.isPending

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFeedback("")
    setDados([])
    setErros([])
    setFileName("")
    setRateios([])
    setSelectedPraca("")
    setSelectedPercentual("")
    setIncrementoDraft("0")
    setIncrementoAplicado(0)
    setIncrementoError("")
    setRateioError("")
    onImportedDataChange(false)

    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setErros([
        {
          linha: 1,
          mensagem: "O arquivo deve estar no formato .xlsx.",
        },
      ])
      event.target.value = ""
      return
    }

    setFileName(file.name)
    onImportedDataChange(true)

    try {
      const rows = await lerArquivoMetas(file)
      const result = validarMetasImportadas(rows)
      setDados(result.dadosValidos)
      setErros(result.erros)
    } catch {
      setErros([
        {
          linha: 1,
          mensagem: "Nao foi possivel ler o arquivo selecionado.",
        },
      ])
    }
  }

  async function handleSubmitImport() {
    setFeedback("")

    try {
      await importarMetasMutation.mutateAsync({
        estado,
        year,
        month,
        itens: dados,
        itensComIncremento: dadosComIncremento,
        percentualIncremento: incrementoAplicado,
        rateios,
      })
      setFeedbackType("success")
      setFeedback("Importacao enviada com sucesso.")
      onNotify({
        type: "success",
        title: "Importacao enviada",
        message: "As metas Avert foram cadastradas com sucesso.",
      })
      setDados([])
      setErros([])
      setFileName("")
      setRateios([])
      setSelectedPraca("")
      setSelectedPercentual("")
      setIncrementoDraft("0")
      setIncrementoAplicado(0)
      setIncrementoError("")
      setRateioError("")
      onImportedDataChange(false)
      onImportSuccess()

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      const errorMessage = getImportErrorMessage(error)

      setFeedbackType("error")
      setFeedback(errorMessage)
      onNotify({
        type: "error",
        title: "Erro ao enviar importacao",
        message: errorMessage,
      })
    }
  }

  function handleIncrementoChange(value: string) {
    setIncrementoDraft(value)

    if (!/^\d*$/.test(value)) {
      setIncrementoError("O incremento deve ser um numero inteiro.")
      return
    }

    setIncrementoError("")
  }

  function handleApplyIncremento() {
    if (!/^\d+$/.test(incrementoDraft)) {
      setIncrementoError("O incremento deve ser um numero inteiro.")
      return
    }

    const nextIncremento = Number(incrementoDraft)
    setIncrementoAplicado(nextIncremento)
    setIncrementoError("")
    setRateios([])
    setRateioError("")
  }

  function handleCancelIncremento() {
    setIncrementoDraft("0")
    setIncrementoAplicado(0)
    setIncrementoError("")
    setRateios([])
    setRateioError("")
  }

  function handleClearFile() {
    setFeedback("")
    setDados([])
    setErros([])
    setFileName("")
    setRateios([])
    setSelectedPraca("")
    setSelectedPercentual("")
    setIncrementoDraft("0")
    setIncrementoAplicado(0)
    setIncrementoError("")
    setRateioError("")
    onImportedDataChange(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleAddRateio() {
    setRateioError("")

    if (!selectedPraca) {
      setRateioError("Selecione uma praca para o rateio.")
      return
    }

    if (!/^\d+$/.test(selectedPercentual)) {
      setRateioError("O percentual deve ser um numero inteiro.")
      return
    }

    const percentual = Number(selectedPercentual)

    if (percentual <= 0 || percentual > 100) {
      setRateioError("O percentual deve estar entre 1 e 100.")
      return
    }

    if (percentualTotal + percentual > 100) {
      setRateioError("A soma dos percentuais nao pode ultrapassar 100%.")
      return
    }

    setRateios((current) => [
      ...current,
      {
        praca: selectedPraca,
        percentual,
      },
    ])
    setSelectedPraca("")
    setSelectedPercentual("")
  }

  function handleRemoveRateio(praca: string) {
    setRateios((current) => current.filter((rateio) => rateio.praca !== praca))
    setRateioError("")
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-primary" />
            <CardTitle className="text-lg">Arquivo XLSX</CardTitle>
          </div>
          <CardDescription>
            O arquivo deve conter exatamente as colunas codprod, qt e vlr para o
            estado {estado}, no periodo {String(month).padStart(2, "0")}/{year}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={gerarModeloImportacaoMetas}
            >
              <Download className="size-4" />
              Baixar modelo
            </Button>

            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              <Upload className="size-4" />
              Selecionar XLSX
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {fileName ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Arquivo selecionado:{" "}
                <span className="font-semibold text-foreground">
                  {fileName}
                </span>
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={handleClearFile}
              >
                <Trash2 className="size-4" />
                Excluir arquivo
              </Button>
            </div>
          ) : null}

          {feedback ? (
            <div
              className={`flex items-start gap-2 rounded-2xl border p-4 text-sm ${
                feedbackType === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {feedbackType === "success" ? (
                <CheckCircle className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <span>{feedback}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {dados.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardDescription>Itens importados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">
                {formatInteger(resumo.totalItens)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardDescription>Total de quantidade</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">
                {formatInteger(resumo.totalQuantidade)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardDescription>Total de valor</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(resumo.totalValor)}
              </p>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {dados.length > 0 && erros.length === 0 ? (
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Incremento da meta</CardTitle>
            <CardDescription>
              Aplique um percentual inteiro antes de ratear a meta entre as
              pracas. Quantidade e valor sao arredondados para cima.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-end">
              <div className="grid gap-2">
                <label
                  htmlFor="incremento-meta"
                  className="text-sm font-medium"
                >
                  Incremento %
                </label>
                <Input
                  id="incremento-meta"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  className="h-11 rounded-xl"
                  value={incrementoDraft}
                  onChange={(event) =>
                    handleIncrementoChange(event.target.value)
                  }
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                Base original: {formatInteger(resumoOriginal.totalQuantidade)}{" "}
                itens em quantidade e {formatCurrency(resumoOriginal.totalValor)}
                . Estimativa com incremento:{" "}
                <span className="font-semibold text-foreground">
                  {formatInteger(resumoEstimado.totalQuantidade)} em quantidade
                  e {formatCurrency(resumoEstimado.totalValor)}
                </span>
                .
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="h-11 rounded-xl"
                onClick={handleApplyIncremento}
              >
                Aplicar incremento
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                onClick={handleCancelIncremento}
                disabled={incrementoAplicado === 0 && incrementoDraft === "0"}
              >
                Cancelar incremento
              </Button>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">
              Incremento aplicado: {incrementoAplicado}%. O rateio e o preview
              abaixo usam apenas o incremento aplicado.
            </div>

            {incrementoError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {incrementoError}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {erros.length > 0 ? (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <CardTitle className="text-lg">Erros de validacao</CardTitle>
            </div>
            <CardDescription>
              Corrija o arquivo e importe novamente antes de enviar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {erros.map((erro, index) => (
                <div
                  key={`${erro.linha}-${erro.campo ?? "arquivo"}-${index}`}
                  className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  Linha {erro.linha}: {erro.mensagem}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {dados.length > 0 && erros.length === 0 ? (
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPinned className="size-4 text-primary" />
              <CardTitle className="text-lg">Rateio por praca</CardTitle>
            </div>
            <CardDescription>
              Distribua a meta total do estado entre as pracas. A soma deve ser
              exatamente 100%.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
              <select
                value={selectedPraca}
                onChange={(event) => setSelectedPraca(event.target.value)}
                className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecione a praca</option>
                {availablePracas.map((praca) => (
                  <option key={praca} value={praca}>
                    {praca}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                min="1"
                max="100"
                step="1"
                inputMode="numeric"
                className="h-11 rounded-xl"
                placeholder="%"
                value={selectedPercentual}
                onChange={(event) => setSelectedPercentual(event.target.value)}
              />

              <Button
                type="button"
                className="h-11 rounded-xl"
                onClick={handleAddRateio}
                disabled={availablePracas.length === 0 || percentualTotal === 100}
              >
                <Plus className="size-4" />
                Adicionar
              </Button>
            </div>

            {rateioError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {rateioError}
              </div>
            ) : null}

            <div
              className={`rounded-2xl border p-4 text-sm ${
                percentualTotal === 100
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              Percentual distribuido: {percentualTotal}% de 100%
              {percentualTotal < 100
                ? ` - faltam ${100 - percentualTotal}%.`
                : null}
            </div>

            {rateios.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                    <thead className="bg-muted/60 text-muted-foreground">
                      <tr className="border-b border-border/70">
                        <th className="px-4 py-3 text-left font-medium">
                          Praca
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Percentual
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Quantidade
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Valor
                        </th>
                        <th className="px-4 py-3 text-right font-medium">
                          Acoes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateios.map((rateio) => (
                        <tr
                          key={rateio.praca}
                          className="border-b border-border/70 last:border-b-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            {rateio.praca}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {rateio.percentual}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatInteger(
                              getRateioQuantidadeTotal(
                                dadosComIncremento,
                                rateio.percentual
                              )
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(
                              getRateioValorTotal(
                                dadosComIncremento,
                                rateio.percentual
                              )
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleRemoveRateio(rateio.praca)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {dados.length > 0 ? (
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-emerald-700 dark:text-emerald-300" />
              <CardTitle className="text-lg">Preview da importacao</CardTitle>
            </div>
            <CardDescription>
              Dados preparados para envio das metas Avert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/70">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="bg-muted/60 text-muted-foreground">
                    <tr className="border-b border-border/70">
                      <th className="px-4 py-3 text-left font-medium">
                        codprod
                      </th>
                      <th className="px-4 py-3 text-right font-medium">qt</th>
                      <th className="px-4 py-3 text-right font-medium">vlr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosComIncremento.map((item, index) => (
                      <tr
                        key={`${item.codprod}-${index}`}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {item.codprod}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatInteger(item.qt)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(item.vlr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Button
              type="button"
              className="h-11 w-full rounded-xl sm:w-fit"
              disabled={!canSubmit}
              onClick={handleSubmitImport}
            >
              {importarMetasMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Enviar importacao
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
