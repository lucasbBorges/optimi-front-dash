import colors from "tailwindcss/colors"
import {
  Building2,
  LoaderCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardCalendarType, PerformancePeriod } from "@/lib/results"
import Chart from "./chart"

type SupplierData = {
  supplierCode: number
  supplierName: string
  faturado: number
  meta: number
}

const colorsChart = [
  colors.teal[400],
  colors.amber[400],
  colors.cyan[400],
  colors.indigo[400],
]

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

function buildSupplierData(period: PerformancePeriod | null): SupplierData[] {
  if (!period) {
    return []
  }

  return period.suppliers.map((supplier) => {
    return {
      supplierCode: supplier.supplierCode,
      supplierName: supplier.supplierName,
      faturado: supplier.amount,
      meta: supplier.goal,
    }
  })
}

export default function FornecsChartComponent({
  activeCalendar,
  period,
  isLoading,
  errorMessage,
}: {
  activeCalendar: DashboardCalendarType
  period: PerformancePeriod | null
  isLoading: boolean
  errorMessage: string | null
}) {
  const dados = buildSupplierData(period)
  const hasGoals = period?.hasGoals ?? false

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Building2 className="size-3.5" />
            Fornecedores
          </span>
          <span className="text-xs text-muted-foreground">
            {dados.length > 0
              ? `${dados.length} parceiros monitorados`
              : activeCalendar === "21"
                ? "Ciclo 21 a 20"
                : "Ciclo 01 a 30"}
          </span>
        </div>
        <CardTitle className="text-lg">Desempenho por fornecedor</CardTitle>
        <CardDescription>
          Faturamento e meta vinculados por codigo do fornecedor no periodo selecionado.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Buscando detalhamento de faturado por fornecedor.
            </p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && !hasGoals && (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Metas ainda nao cadastradas
            </p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          hasGoals &&
          dados.map((dado, i) => {
          const radius =
            dado.meta > 0 ? Math.min((dado.faturado / dado.meta) * 360, 360) : 12
          const color = colorsChart[i % colorsChart.length]
          const metaAtingPercent =
            dado.meta > 0 ? Math.round((dado.faturado * 100) / dado.meta) : 0
          const remaining = dado.meta - dado.faturado
          const aboveTarget = remaining <= 0

          return (
            <div
              className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm"
              key={dado.supplierCode}
            >
              <div className="flex items-center gap-3">
                <div className="flex min-w-[102px] justify-center rounded-2xl bg-muted/40 px-2 py-1">
                  <Chart
                    color={color}
                    radius={radius}
                    metaAtingPercent={metaAtingPercent}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">
                        {dado.supplierName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {`Codigo do fornecedor: ${dado.supplierCode}`}
                      </p>
                    </div>

                    <span
                      className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Faturado
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatCurrency(dado.faturado)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Meta
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatCurrency(dado.meta)}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs font-medium ${
                      aboveTarget
                        ? "text-emerald-600 dark:text-emerald-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {aboveTarget ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <TrendingDown className="size-3.5" />
                    )}
                    <span>
                      {aboveTarget
                        ? `Acima da meta em ${formatCurrency(Math.abs(remaining))}`
                        : `Faltam ${formatCurrency(remaining)} para a meta`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
