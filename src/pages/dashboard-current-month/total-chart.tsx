import { LoaderCircle, Target, TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import colors from "tailwindcss/colors"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { getUserResultLabel, getUserScopeLabel, useAuth } from "@/lib/auth"
import type { DashboardCalendarType, PerformancePeriod } from "@/lib/results"

const chartConfig = {
  visitors: {
    label: "Faturado R$",
  },
  safari: {
    label: "Faturamento",
    color: colors.sky[400],
  },
}

const dataAtual = new Date()
const nomeMesPorExtenso = dataAtual
  .toLocaleDateString("pt-BR", { month: "long" })
  .replace(/^\w/, (char) => char.toUpperCase())

const calendarLabel: Record<DashboardCalendarType, string> = {
  "21": "Ciclo 21 a 20",
  "30": "Ciclo 01 a 30",
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export default function TotalChart({
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
  const { currentUser } = useAuth()
  const scopeLabel = getUserScopeLabel(currentUser)
  const resultLabel = getUserResultLabel(currentUser)
  const faturado = period?.totalAmount ?? 0
  const meta = period?.totalGoal ?? 0
  const hasGoals = period?.hasGoals ?? false
  const percentualMeta = meta > 0 ? Math.round((faturado / meta) * 100) : 0
  const endAngle = hasGoals
    ? Math.max(Math.min((percentualMeta / 100) * 360, 360), 12)
    : 12
  const metaRestante = Math.max(meta - faturado, 0)
  const chartData = [
    {
      browser: "safari",
      visitors: faturado,
      fill: "var(--color-safari)",
    },
  ]

  return (
    <Card className="overflow-hidden border-border/70">
      <CardHeader className="pb-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <TrendingUp className="size-3.5" />
            Faturamento do mes
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {calendarLabel[activeCalendar]}
          </span>
        </div>
        <CardTitle style={{ fontSize: "1.125rem" }}>
          {`Faturamento R$ - ${scopeLabel}`}
        </CardTitle>
        <CardDescription>{`Faturado do mes corrente - ${nomeMesPorExtenso}`}</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 pt-2 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="min-w-0 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/8 via-background to-background p-3 shadow-sm">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[240px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={endAngle}
              innerRadius={72}
              outerRadius={96}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[78, 66]}
              />
              <RadialBar dataKey="visitors" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-muted-foreground text-[12px]"
                          >
                            Faturado
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 14}
                            className="fill-foreground font-bold"
                            style={{ fontSize: "1rem" }}
                          >
                            {isLoading ? "..." : formatCurrency(faturado)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 36}
                            className="fill-muted-foreground text-[12px]"
                          >
                            {isLoading
                              ? "Carregando"
                              : hasGoals
                                ? `${percentualMeta}% da meta`
                                : "Sem metas"}
                          </tspan>
                        </text>
                      )
                    }

                    return null
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <TrendingUp className="size-4" />
              <p className="text-xs font-medium uppercase tracking-[0.16em]">
                Ritmo atual
              </p>
            </div>
            <p className="text-xl font-bold tracking-tight">
              {isLoading ? "Carregando..." : formatCurrency(faturado)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {errorMessage ??
                `Visualizacao do ${resultLabel} para ${scopeLabel.toLowerCase()}.`}
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
              <Target className="size-4" />
              <p className="text-xs font-medium uppercase tracking-[0.16em]">
                Meta restante
              </p>
            </div>
            <p className="text-xl font-bold tracking-tight">
              {hasGoals ? formatCurrency(metaRestante) : "Metas ainda nao cadastradas"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hasGoals
                ? `Meta do periodo: ${formatCurrency(meta)}.`
                : "Nao ha metas cadastradas para o periodo selecionado."}
            </p>
          </div>

          {(isLoading || errorMessage) && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-xs text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Buscando faturamento atualizado na API.
                </span>
              ) : (
                errorMessage
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
