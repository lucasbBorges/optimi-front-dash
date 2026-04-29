import { useState } from "react"
import {
  CalendarRange,
  ChevronDown,
  CircleDollarSign,
  LoaderCircle,
  Target,
  TrendingUp,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { getBillingScopeLabel } from "@/lib/billing-scope"
import {
  getBillingErrorMessage,
  getBillingPeriod,
  getGoalPeriod,
  getGoalsErrorMessage,
  mergePerformancePeriod,
  useBillingResults,
  useGoalsResults,
} from "@/lib/results"
import TotalChart from "./total-chart"
import FornecsChartComponent from "./fornecs-chart/fornecs-chart-component"

type ActiveCalendarType = "21" | "30"

const summaryByCalendar: Record<
  ActiveCalendarType,
  {
    periodo: string
  }
> = {
  "21": {
    periodo: "Ciclo 21 a 20",
  },
  "30": {
    periodo: "Ciclo 01 a 30",
  },
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const [activeCalendar, setActiveCalendar] =
    useState<ActiveCalendarType>("30")
  const billingResultsQuery = useBillingResults(currentUser)
  const goalsResultsQuery = useGoalsResults(currentUser)

  const summary = summaryByCalendar[activeCalendar]
  const billingPeriod = getBillingPeriod(billingResultsQuery.data, activeCalendar)
  const goalPeriod = getGoalPeriod(goalsResultsQuery.data, activeCalendar)
  const selectedPeriod = mergePerformancePeriod(billingPeriod, goalPeriod)
  const billingScopeLabel = getBillingScopeLabel(
    currentUser,
    billingResultsQuery.data?.representativeCode
  )
  const goalsScopeLabel = getBillingScopeLabel(
    currentUser,
    goalsResultsQuery.data?.representativeCode
  )
  const faturamentoAtual = selectedPeriod?.totalAmount ?? 0
  const metaAtual = selectedPeriod?.totalGoal ?? 0
  const faturamentoFormatado = billingResultsQuery.isLoading
    ? "Carregando..."
    : billingPeriod
      ? formatCurrency(faturamentoAtual)
      : "Indisponivel"
  const gapToGoal = metaAtual - faturamentoAtual
  const metaFormatada = goalsResultsQuery.isLoading
    ? "Carregando..."
    : selectedPeriod?.hasGoals
      ? formatCurrency(metaAtual)
      : "Metas ainda nao cadastradas"
  const percentualMeta = metaAtual
    ? `${Math.min(Math.round((faturamentoAtual / metaAtual) * 1000) / 10, 999)}%`
    : "Metas ainda nao cadastradas"
  const billingErrorMessage = billingResultsQuery.isError
    ? getBillingErrorMessage(billingResultsQuery.error)
    : null
  const goalsErrorMessage = goalsResultsQuery.isError
    ? getGoalsErrorMessage(goalsResultsQuery.error)
    : null
  const loadingData = billingResultsQuery.isLoading || goalsResultsQuery.isLoading
  const helperMessage = billingErrorMessage || goalsErrorMessage
  const gapToGoalLabel = loadingData
    ? "Carregando..."
    : !selectedPeriod?.hasGoals
      ? "Metas ainda nao cadastradas"
      : formatCurrency(Math.abs(gapToGoal))
  const gapToGoalTitle = !selectedPeriod?.hasGoals
    ? "Meta pendente"
    : gapToGoal > 0
      ? "Falta para meta"
      : "Superavit"
  const gapToGoalDescription = !selectedPeriod?.hasGoals
    ? "Cadastre a meta do periodo para acompanhar o saldo."
    : gapToGoal > 0
      ? "Valor necessario para atingir a meta no periodo."
      : "Valor faturado acima da meta no periodo."

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Painel comercial</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Acompanhamento do faturamento do mes corrente com foco em meta
                e desempenho por fornecedor.
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-auto min-w-[122px] rounded-2xl border-primary/20 px-3 py-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CalendarRange className="size-4 text-primary" />
                  <div className="text-left">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Periodo
                    </p>
                    <p className="text-sm font-semibold">
                      {activeCalendar === "21" ? "21 a 20" : "01 a 30"}
                    </p>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="z-50 min-w-36 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              <DropdownMenuItem
                onClick={() => setActiveCalendar("21")}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm outline-none ${
                  activeCalendar === "21"
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                21 a 20
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveCalendar("30")}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm outline-none ${
                  activeCalendar === "30"
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground"
                }`}
              >
                01 a 30
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
          <CardHeader className="pb-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <TrendingUp className="size-3.5" />
                Visao geral do mes
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {summary.periodo}
              </span>
            </div>
            <CardTitle className="text-base">Resumo executivo</CardTitle>
            <CardDescription>
              Leitura rapida do faturamento atual e do ritmo de entrega da meta.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <CircleDollarSign className="size-4" />
                <p className="text-xs font-medium uppercase tracking-[0.16em]">
                  Faturado
                </p>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {faturamentoFormatado}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {billingErrorMessage ??
                  "Resultado acumulado no periodo selecionado."}
              </p>
              {billingScopeLabel ? (
                <p className="mt-2 text-xs font-medium text-primary/80">
                  Consulta aplicada para {billingScopeLabel}.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                <Target className="size-4" />
                <p className="text-xs font-medium uppercase tracking-[0.16em]">
                  Meta atingida
                </p>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {percentualMeta}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {goalsErrorMessage ?? `Meta do ciclo: ${metaFormatada}`}
              </p>
              {goalsScopeLabel ? (
                <p className="mt-2 text-xs font-medium text-emerald-700/90 dark:text-emerald-300">
                  Meta carregada para {goalsScopeLabel}.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <CalendarRange className="size-4" />
                <p className="text-xs font-medium uppercase tracking-[0.16em]">
                  {gapToGoalTitle}
                </p>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {gapToGoalLabel}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {gapToGoalDescription}
              </p>
            </div>
          </CardContent>

          {(loadingData || helperMessage) && (
            <div className="border-t border-border/60 px-6 py-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                {loadingData ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Sincronizando faturado e metas pela API.
                  </>
                ) : (
                  helperMessage
                )}
              </p>
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <TotalChart
          activeCalendar={activeCalendar}
          period={selectedPeriod}
          isLoading={loadingData}
          errorMessage={helperMessage}
        />
        <FornecsChartComponent
          activeCalendar={activeCalendar}
          period={selectedPeriod}
          isLoading={loadingData}
          errorMessage={helperMessage}
        />
      </section>
    </div>
  )
}
