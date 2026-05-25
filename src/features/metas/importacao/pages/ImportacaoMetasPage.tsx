import { useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  FileSpreadsheet,
  MapPinned,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImportacaoMetasUploader } from "../components/ImportacaoMetasUploader"
import type { EstadoMetaImportacao } from "../types"

const stateOptions: Array<{
  value: EstadoMetaImportacao
  label: string
  description: string
}> = [
  {
    value: "RS",
    label: "Rio Grande do Sul",
    description: "Importar metas Avert para o estado do RS.",
  },
  {
    value: "SC",
    label: "Santa Catarina",
    description: "Importar metas Avert para o estado de SC.",
  },
]

const monthOptions = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Marco" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
]

type ImportNotification = {
  type: "success" | "error"
  title: string
  message: string
}

function ImportNotificationPopup({
  notification,
  onClose,
}: {
  notification: ImportNotification | null
  onClose: () => void
}) {
  if (!notification) {
    return null
  }

  const isSuccess = notification.type === "success"

  return (
    <div className="fixed inset-x-4 top-4 z-[60] sm:left-auto sm:right-4 sm:w-[380px]">
      <div
        className={`rounded-2xl border bg-card p-4 shadow-lg ${
          isSuccess
            ? "border-emerald-500/30"
            : "border-destructive/30"
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          ) : (
            <X className="mt-0.5 size-5 shrink-0 text-destructive" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{notification.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {notification.message}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            aria-label="Fechar mensagem"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ImportacaoMetasPage() {
  const [estadoSelecionado, setEstadoSelecionado] =
    useState<EstadoMetaImportacao | null>(null)
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [hasImportedData, setHasImportedData] = useState(false)
  const [notification, setNotification] = useState<ImportNotification | null>(
    null
  )
  const yearNumber = Number(selectedYear)
  const monthNumber = Number(selectedMonth)
  const hasValidPeriod =
    Number.isInteger(yearNumber) &&
    yearNumber >= 2000 &&
    yearNumber <= 2100 &&
    Number.isInteger(monthNumber) &&
    monthNumber >= 1 &&
    monthNumber <= 12

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ImportNotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />

      <section className="space-y-3">
        <Button asChild variant="ghost" className="w-fit px-0 text-primary">
          <Link to="/metas/avert">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Metas Avert</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Importar metas por item
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Baixe o modelo, preencha os dados de codprod, qt e vlr, depois
              importe o arquivo para validar e enviar.
            </p>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <CardHeader className="pb-3">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <FileSpreadsheet className="size-4" />
            <CardTitle className="text-base">Formato esperado</CardTitle>
          </div>
          <CardDescription>
            A primeira aba do XLSX sera lida e validada antes do envio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/70 bg-background/80 text-center text-sm font-semibold">
            <div className="border-r border-border/70 px-3 py-2">codprod</div>
            <div className="border-r border-border/70 px-3 py-2">qt</div>
            <div className="px-3 py-2">vlr</div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-2">
        {stateOptions.map((option) => {
          const isSelected = estadoSelecionado === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={hasImportedData}
              className={`rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                isSelected
                  ? "cursor-pointer border-primary/50 bg-primary/8"
                  : hasImportedData
                    ? "cursor-not-allowed border-border/70 bg-muted/30 opacity-60"
                  : "cursor-pointer border-border/70 bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
              onClick={() => {
                if (!hasImportedData) {
                  setEstadoSelecionado(option.value)
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                    <MapPinned className="size-3.5" />
                    {option.value}
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{option.label}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                {isSelected ? (
                  <CheckCircle className="size-5 shrink-0 text-primary" />
                ) : null}
              </div>
            </button>
          )
        })}
      </section>

      <Card className="border-border/70">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <CardTitle className="text-lg">Periodo da meta</CardTitle>
          </div>
          <CardDescription>
            Informe o ano e o mes antes de importar o arquivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="meta-avert-year" className="text-sm font-medium">
              Ano
            </label>
            <Input
              id="meta-avert-year"
              type="number"
              min="2000"
              max="2100"
              step="1"
              inputMode="numeric"
              className="h-11 rounded-xl"
              value={selectedYear}
              disabled={hasImportedData}
              onChange={(event) => setSelectedYear(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="meta-avert-month" className="text-sm font-medium">
              Mes
            </label>
            <select
              id="meta-avert-month"
              value={selectedMonth}
              disabled={hasImportedData}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione o mes</option>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {hasImportedData ? (
        <Card className="border-primary/20 bg-primary/8">
          <CardContent className="p-4 text-sm text-primary">
            Estado, ano e mes travados apos a importacao do arquivo. Para
            alterar o periodo, finalize ou limpe a importacao atual.
          </CardContent>
        </Card>
      ) : null}

      {estadoSelecionado && hasValidPeriod ? (
        <ImportacaoMetasUploader
          estado={estadoSelecionado}
          year={yearNumber}
          month={monthNumber}
          onImportedDataChange={setHasImportedData}
          onImportSuccess={() => {
            setEstadoSelecionado(null)
            setSelectedYear("")
            setSelectedMonth("")
            setHasImportedData(false)
          }}
          onNotify={setNotification}
        />
      ) : (
        <Card className="border-border/70">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Selecione o estado, ano e mes antes de baixar ou importar o arquivo
            XLSX.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
