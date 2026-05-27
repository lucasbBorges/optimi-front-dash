import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  Boxes,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  CircleDollarSign,
  Layers3,
  LoaderCircle,
  PackageCheck,
  PackageOpen,
  Search,
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
import { useAuth } from "@/lib/auth"
import {
  getAvertSalesErrorMessage,
  getMetasAvertErrorMessage,
  useAvertItemSales,
  useMetasAvertFamilies,
  type AvertItemSalesItem,
  type MetaAvertFamilyGroup,
  type MetaAvertFamilyProduct,
} from "@/lib/metas-avert"

type FamilyTone = "teal" | "amber" | "cyan" | "emerald" | "rose"

const familyTones: FamilyTone[] = ["teal", "amber", "cyan", "emerald", "rose"]

const toneClasses: Record<
  FamilyTone,
  {
    badge: string
    icon: string
    bar: string
  }
> = {
  teal: {
    badge: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    icon: "text-teal-700 dark:text-teal-300",
    bar: "bg-teal-500",
  },
  amber: {
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    icon: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  cyan: {
    badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    icon: "text-cyan-700 dark:text-cyan-300",
    bar: "bg-cyan-500",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  rose: {
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: "text-rose-700 dark:text-rose-300",
    bar: "bg-rose-500",
  },
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const quantityFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
})

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

const rolesWithFamilyAccess = ["admin", "supervisor", "representante"] as const

type AvertFamilyProductView = MetaAvertFamilyProduct & {
  salesAmount: number
  distinctCustomerCount: number
  achievementPercent: number
  remainingAmount: number
}

type AvertFamilyViewGroup = Omit<MetaAvertFamilyGroup, "products"> & {
  products: AvertFamilyProductView[]
  salesAmount: number
  achievementPercent: number
  remainingAmount: number
}

type AvertAnomalies = {
  goalsWithoutFamily: AvertFamilyProductView[]
  salesWithoutGoal: AvertItemSalesItem[]
  goalWithoutFamilyAmount: number
  saleWithoutGoalAmount: number
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatQuantity(value: number) {
  return quantityFormatter.format(value)
}

function getTotalAmount(families: MetaAvertFamilyGroup[]) {
  return families.reduce((total, family) => total + family.amount, 0)
}

function getTotalSalesAmount(families: AvertFamilyViewGroup[]) {
  return families.reduce((total, family) => total + family.salesAmount, 0)
}

function getTotalQuantity(families: MetaAvertFamilyGroup[]) {
  return families.reduce((total, family) => total + family.quantity, 0)
}

function getTotalItems(families: MetaAvertFamilyGroup[]) {
  return families.reduce((total, family) => total + family.products.length, 0)
}

function getPeriodDates(ano: number | null, mes: number | null) {
  const referenceDate = new Date()
  const year = ano ?? referenceDate.getFullYear()
  const month = mes ?? referenceDate.getMonth() + 1
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDateValue = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(
    endDateValue
  ).padStart(2, "0")}`

  return { startDate, endDate }
}

function enrichFamiliesWithSales(
  families: MetaAvertFamilyGroup[],
  salesItems: AvertItemSalesItem[]
): AvertFamilyViewGroup[] {
  const salesByProduct = new Map(
    salesItems.map((item) => [item.productCode, item])
  )

  return families.map((family) => {
    const products = family.products.map((product) => {
      const salesItem = salesByProduct.get(product.productCode)
      const salesAmount = salesItem?.totalAmount ?? 0
      const remainingAmount = product.amount - salesAmount
      const achievementPercent =
        product.amount > 0
          ? Math.round((salesAmount * 1000) / product.amount) / 10
          : 0

      return {
        ...product,
        salesAmount,
        distinctCustomerCount: salesItem?.distinctCustomerCount ?? 0,
        achievementPercent,
        remainingAmount,
      }
    })
    const salesAmount = products.reduce(
      (total, product) => total + product.salesAmount,
      0
    )
    const remainingAmount = family.amount - salesAmount
    const achievementPercent =
      family.amount > 0
        ? Math.round((salesAmount * 1000) / family.amount) / 10
        : 0

    return {
      ...family,
      products,
      salesAmount,
      achievementPercent,
      remainingAmount,
    }
  })
}

function getAvertAnomalies(
  families: AvertFamilyViewGroup[],
  salesItems: AvertItemSalesItem[]
): AvertAnomalies {
  const goalProductCodes = new Set<number>()
  const goalsWithoutFamily: AvertFamilyProductView[] = []

  for (const family of families) {
    const hasNoFamily = family.family.trim().toLocaleLowerCase("pt-BR") === "sem familia"

    for (const product of family.products) {
      goalProductCodes.add(product.productCode)

      if (hasNoFamily) {
        goalsWithoutFamily.push(product)
      }
    }
  }

  const salesWithoutGoal = salesItems.filter((item) => {
    return item.totalAmount > 0 && !goalProductCodes.has(item.productCode)
  })

  return {
    goalsWithoutFamily,
    salesWithoutGoal,
    goalWithoutFamilyAmount: goalsWithoutFamily.reduce(
      (total, product) => total + product.amount,
      0
    ),
    saleWithoutGoalAmount: salesWithoutGoal.reduce(
      (total, item) => total + item.totalAmount,
      0
    ),
  }
}

function getFamilyTone(index: number) {
  return familyTones[index % familyTones.length]
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon className="size-4" />
        <p className="text-xs font-medium uppercase tracking-[0.16em]">
          {title}
        </p>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function AvertAnomaliesCard({ anomalies }: { anomalies: AvertAnomalies }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasAnomalies =
    anomalies.goalsWithoutFamily.length > 0 ||
    anomalies.salesWithoutGoal.length > 0

  if (!hasAnomalies) {
    return null
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/10">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4" />
              <CardTitle className="text-lg">Anomalias para corrigir</CardTitle>
            </div>
            <CardDescription className="mt-2">
              Itens que precisam de ajuste cadastral para fechar a leitura por
              familia e por meta.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-xl bg-background/70"
            onClick={() => setIsExpanded((current) => !current)}
          >
            <ChevronsUpDown className="size-4" />
            {isExpanded ? "Recolher" : "Expandir"}
          </Button>
        </div>
      </CardHeader>
      <CardContent
        className={isExpanded ? "grid gap-3 lg:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}
      >
        <div className="rounded-2xl border border-amber-500/30 bg-background/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Metas sem familia</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Itens com meta cadastrada, mas sem familia Avert vinculada.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              {anomalies.goalsWithoutFamily.length}
            </span>
          </div>
          <p className="mt-3 text-xl font-bold">
            {formatCurrency(anomalies.goalWithoutFamilyAmount)}
          </p>
          {isExpanded ? (
          <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-1">
            {anomalies.goalsWithoutFamily.length > 0 ? (
              anomalies.goalsWithoutFamily.map((item) => (
                <div
                  key={item.productCode}
                  className="rounded-xl border border-border/70 bg-background px-3 py-2"
                >
                  <p className="line-clamp-1 text-sm font-medium">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Codigo {item.productCode} - Meta {formatCurrency(item.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma meta sem familia encontrada.
              </p>
            )}
          </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-background/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Faturado sem meta</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Itens faturados no periodo que nao possuem meta cadastrada.
              </p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              {anomalies.salesWithoutGoal.length}
            </span>
          </div>
          <p className="mt-3 text-xl font-bold">
            {formatCurrency(anomalies.saleWithoutGoalAmount)}
          </p>
          {isExpanded ? (
          <div className="mt-3 max-h-52 space-y-2 overflow-auto pr-1">
            {anomalies.salesWithoutGoal.length > 0 ? (
              anomalies.salesWithoutGoal.map((item) => (
                <div
                  key={item.productCode}
                  className="rounded-xl border border-border/70 bg-background px-3 py-2"
                >
                  <p className="text-sm font-medium">
                    Produto {item.productCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Faturado {formatCurrency(item.totalAmount)} -{" "}
                    {formatQuantity(item.distinctCustomerCount)} clientes
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum faturamento sem meta encontrado.
              </p>
            )}
          </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function FamilyCard({
  family,
  tone,
  isSelected,
  showSales,
  onSelect,
}: {
  family: AvertFamilyViewGroup
  tone: FamilyTone
  isSelected: boolean
  showSales: boolean
  onSelect: () => void
}) {
  const achievementPercent = showSales ? family.achievementPercent : 0
  const toneClass = toneClasses[tone]
  const topProduct = family.products[0]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full cursor-pointer rounded-2xl border bg-card text-left shadow-sm transition-colors ${
        isSelected
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border/70 hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${toneClass.badge}`}
          >
            <Layers3 className="size-3.5" />
            {family.family}
          </span>
          <ChevronRight
            className={`size-4 transition-transform ${
              isSelected ? "rotate-90 text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-3">
          <div>
            <p className="text-xl font-bold tracking-tight">
              {formatCurrency(family.amount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {showSales
                ? `${formatCurrency(family.salesAmount)} faturados, ${family.achievementPercent}% da meta.`
                : `${family.products.length} itens, ${formatQuantity(family.quantity)} unidades.`}
            </p>
          </div>
          <PackageCheck className={`mt-1 size-4 ${toneClass.icon}`} />
        </div>
        <div className="space-y-2">
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Atingimento da meta</span>
            <span className="font-semibold">{achievementPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${toneClass.bar}`}
              style={{ width: `${Math.min(achievementPercent, 100)}%` }}
            />
          </div>
        </div>

        {topProduct ? (
          <div className="mt-4 rounded-xl bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Principal item
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold">
              {topProduct.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {showSales
                ? `${formatCurrency(topProduct.salesAmount)} faturados de ${formatCurrency(topProduct.amount)}.`
                : `${formatCurrency(topProduct.amount)} em ${formatQuantity(topProduct.quantity)} unidades.`}
            </p>
          </div>
        ) : null}
      </div>
    </button>
  )
}

function SelectedFamilyItems({
  family,
  tone,
  showSales,
}: {
  family: AvertFamilyViewGroup
  tone: FamilyTone
  showSales: boolean
}) {
  const [search, setSearch] = useState("")
  const toneClass = toneClasses[tone]
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) {
      return family.products
    }

    return family.products.filter((item) => {
      return (
        item.description.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        String(item.productCode).includes(normalizedSearch)
      )
    })
  }, [family.products, normalizedSearch])

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${toneClass.badge}`}
            >
              <PackageOpen className="size-3.5" />
              Itens da familia
            </span>
            <div>
              <CardTitle className="text-xl">{family.family}</CardTitle>
              <CardDescription>
                Produtos consolidados por codigo dentro da familia selecionada.
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left sm:text-right">
            <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </p>
              <p className="break-words text-sm font-semibold">
                {formatCurrency(family.amount)}
              </p>
            </div>
            <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {showSales ? "Faturado" : "Unidades"}
              </p>
              <p className="break-words text-sm font-semibold">
                {showSales
                  ? formatCurrency(family.salesAmount)
                  : formatQuantity(family.quantity)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por produto ou codigo"
            className="pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70">
          {showSales ? (
            <div className="hidden gap-3 bg-muted/50 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_82px_98px_98px]">
              <span>Produto</span>
              <span className="text-right">Real.</span>
              <span className="text-right">Meta</span>
              <span className="text-right">Faturado</span>
            </div>
          ) : (
            <div className="hidden gap-3 bg-muted/50 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_84px_104px]">
              <span>Produto</span>
              <span className="text-right">Qtd.</span>
              <span className="text-right">Valor</span>
            </div>
          )}

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const itemShare =
                showSales
                  ? item.achievementPercent
                  : family.amount > 0
                    ? Math.round((item.amount * 1000) / family.amount) / 10
                    : 0

              return (
                <div
                  key={item.productCode}
                  className="border-t border-border/70 bg-background px-3 py-3"
                >
                  <div
                    className={
                      showSales
                        ? "grid gap-3 md:grid-cols-[minmax(0,1fr)_82px_98px_98px] md:items-start"
                        : "grid gap-3 md:grid-cols-[minmax(0,1fr)_84px_104px] md:items-start"
                    }
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Codigo {item.productCode}
                      </p>
                    </div>
                    {showSales ? (
                      <div className="grid grid-cols-2 gap-2 md:contents">
                        <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2 md:rounded-none md:bg-transparent md:p-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                            Real.
                          </p>
                          <p className="break-words text-sm font-medium md:text-right">
                            {item.achievementPercent}%
                          </p>
                        </div>
                        <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2 md:rounded-none md:bg-transparent md:p-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                            Meta
                          </p>
                          <p className="break-words text-sm font-semibold md:text-right">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                        <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2 md:rounded-none md:bg-transparent md:p-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                            Faturado
                          </p>
                          <p className="break-words text-sm font-semibold md:text-right">
                            {formatCurrency(item.salesAmount)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 md:contents">
                        <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2 md:rounded-none md:bg-transparent md:p-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                            Qtd.
                          </p>
                          <p className="break-words text-sm font-medium md:text-right">
                            {formatQuantity(item.quantity)}
                          </p>
                        </div>
                        <div className="min-w-0 rounded-xl bg-muted/40 px-3 py-2 md:rounded-none md:bg-transparent md:p-0">
                          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                            Valor
                          </p>
                          <p className="break-words text-sm font-semibold md:text-right">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${toneClass.bar}`}
                        style={{ width: `${Math.min(itemShare, 100)}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-xs font-medium">
                      {itemShare}%
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="border-t border-border/70 bg-background px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado nesta familia.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Avert() {
  const { currentUser } = useAuth()
  const canConsultFamilies = Boolean(
    currentUser && rolesWithFamilyAccess.includes(currentUser.role)
  )
  const canConsultSales =
    currentUser?.role === "admin" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "representante"
  const canInspectAnomalies = currentUser?.role === "admin"
  const familyQueryScopeKey = currentUser
    ? [
        currentUser.id,
        currentUser.role,
        currentUser.representativeCode ?? "",
        currentUser.supervisorState ?? "",
      ].join(":")
    : "guest"
  const [yearDraft, setYearDraft] = useState("")
  const [monthDraft, setMonthDraft] = useState("")
  const [appliedPeriod, setAppliedPeriod] = useState<{
    ano: number | null
    mes: number | null
  }>({
    ano: null,
    mes: null,
  })
  const yearNumber = Number(yearDraft)
  const monthNumber = Number(monthDraft)
  const hasCompletePeriod = Boolean(yearDraft && monthDraft)
  const hasValidPeriod =
    !hasCompletePeriod ||
    (Number.isInteger(yearNumber) &&
      yearNumber >= 2000 &&
      yearNumber <= 2100 &&
      Number.isInteger(monthNumber) &&
      monthNumber >= 1 &&
      monthNumber <= 12)
  const familiesQuery = useMetasAvertFamilies({
    enabled: canConsultFamilies,
    ano: appliedPeriod.ano,
    mes: appliedPeriod.mes,
    scopeKey: familyQueryScopeKey,
  })
  const salesPeriod = useMemo(
    () => getPeriodDates(appliedPeriod.ano, appliedPeriod.mes),
    [appliedPeriod.ano, appliedPeriod.mes]
  )
  const salesQuery = useAvertItemSales({
    enabled: canConsultSales,
    startDate: salesPeriod.startDate,
    endDate: salesPeriod.endDate,
    scopeKey: familyQueryScopeKey,
  })
  const metaFamilies = useMemo(
    () => familiesQuery.data?.families ?? [],
    [familiesQuery.data?.families]
  )
  const families = useMemo(
    () => enrichFamiliesWithSales(metaFamilies, salesQuery.data ?? []),
    [metaFamilies, salesQuery.data]
  )
  const anomalies = useMemo(
    () => getAvertAnomalies(families, salesQuery.data ?? []),
    [families, salesQuery.data]
  )
  const [selectedFamilyName, setSelectedFamilyName] = useState("")
  const totalAmount = getTotalAmount(families)
  const totalSalesAmount =
    getTotalSalesAmount(families) +
    (canConsultSales ? anomalies.saleWithoutGoalAmount : 0)
  const totalAchievementPercent =
    totalAmount > 0 ? Math.round((totalSalesAmount * 1000) / totalAmount) / 10 : 0
  const totalQuantity = getTotalQuantity(families)
  const totalItems =
    getTotalItems(families) +
    (canConsultSales ? anomalies.salesWithoutGoal.length : 0)
  const selectedFamily =
    families.find((family) => family.family === selectedFamilyName) ??
    families[0]
  const selectedFamilyIndex = selectedFamily
    ? families.findIndex((family) => family.family === selectedFamily.family)
    : 0
  const errorMessage = familiesQuery.isError
    ? getMetasAvertErrorMessage(familiesQuery.error)
    : canConsultSales && salesQuery.isError
      ? getAvertSalesErrorMessage(salesQuery.error)
      : null
  const isLoadingAvert =
    familiesQuery.isLoading || (canConsultSales && salesQuery.isLoading)

  useEffect(() => {
    if (!selectedFamilyName && families[0]) {
      setSelectedFamilyName(families[0].family)
      return
    }

    if (
      selectedFamilyName &&
      families.length > 0 &&
      !families.some((family) => family.family === selectedFamilyName)
    ) {
      setSelectedFamilyName(families[0].family)
    }
  }, [families, selectedFamilyName])

  function handleApplyPeriod() {
    if (!hasCompletePeriod || !hasValidPeriod) {
      return
    }

    setAppliedPeriod({
      ano: yearNumber,
      mes: monthNumber,
    })
  }

  function handleClearPeriod() {
    setYearDraft("")
    setMonthDraft("")
    setAppliedPeriod({
      ano: null,
      mes: null,
    })
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Avert</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Familias de produtos
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Visao por familia, total vendido e detalhamento por produto no
              escopo do usuario autenticado.
            </p>
          </div>
        </div>

        {!canConsultFamilies ? (
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-300">
              A consulta de familias Avert esta disponivel apenas para usuarios
              autenticados.
            </CardContent>
          </Card>
        ) : null}

        {canConsultFamilies ? (
          <Card className="border-border/70">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-primary" />
                <CardTitle className="text-lg">Periodo de consulta</CardTitle>
              </div>
              <CardDescription>
                Ao abrir a pagina, a API usa o mes corrente. Informe ano e mes
                para pesquisar outro periodo dentro do seu escopo de usuario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[140px_1fr_auto_auto] md:items-end">
                <div className="grid gap-2">
                  <label htmlFor="avert-family-year" className="text-sm font-medium">
                    Ano
                  </label>
                  <Input
                    id="avert-family-year"
                    type="number"
                    min="2000"
                    max="2100"
                    step="1"
                    inputMode="numeric"
                    className="h-11 rounded-xl"
                    value={yearDraft}
                    onChange={(event) => setYearDraft(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="avert-family-month" className="text-sm font-medium">
                    Mes
                  </label>
                  <select
                    id="avert-family-month"
                    value={monthDraft}
                    onChange={(event) => setMonthDraft(event.target.value)}
                    className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Mes corrente</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="button"
                  className="h-11 rounded-xl"
                  disabled={!hasCompletePeriod || !hasValidPeriod}
                  onClick={handleApplyPeriod}
                >
                  Pesquisar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  disabled={!appliedPeriod.ano && !yearDraft && !monthDraft}
                  onClick={handleClearPeriod}
                >
                  Limpar
                </Button>
              </div>

              {!hasValidPeriod ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  Informe ano entre 2000 e 2100 e mes entre 1 e 12.
                </div>
              ) : null}

              <div className="rounded-2xl border border-border/70 bg-muted/30 p-3 text-sm text-muted-foreground">
                Periodo aplicado:{" "}
                <span className="font-semibold text-foreground">
                  {appliedPeriod.ano && appliedPeriod.mes
                    ? `${String(appliedPeriod.mes).padStart(2, "0")}/${appliedPeriod.ano}`
                    : "mes corrente"}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
          <CardHeader className="pb-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Activity className="size-3.5" />
                Consolidado Avert
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {isLoadingAvert ? "Carregando" : `${families.length} familias`}
              </span>
            </div>
            <CardTitle className="text-base">Resumo por agrupamento</CardTitle>
            <CardDescription>
              {canConsultSales
                ? "Totais consolidados a partir das metas e do faturado Avert."
                : "Totais consolidados a partir das metas Avert cadastradas."}
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              title="Meta"
              value={
                isLoadingAvert ? "..." : formatCurrency(totalAmount)
              }
              description="Valor consolidado das metas por familia."
              icon={CircleDollarSign}
            />
            <MetricCard
              title={canConsultSales ? "Faturado" : "Familias"}
              value={
                isLoadingAvert
                  ? "..."
                  : canConsultSales
                    ? formatCurrency(totalSalesAmount)
                    : String(families.length)
              }
              description={
                canConsultSales
                  ? `${totalAchievementPercent}% realizado no periodo.`
                  : "Agrupamentos comerciais monitorados."
              }
              icon={Layers3}
            />
            <MetricCard
              title="Itens"
              value={isLoadingAvert ? "..." : String(totalItems)}
              description={`${formatQuantity(totalQuantity)} unidades distribuidas por produto.`}
              icon={Boxes}
            />
          </CardContent>
        </Card>
      </section>

      {canConsultFamilies && isLoadingAvert ? (
        <Card className="border-border/70">
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              {canConsultSales
                ? "Buscando metas e faturado Avert na API."
                : "Buscando familias Avert na API."}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {canConsultFamilies && errorMessage ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {canConsultFamilies &&
      !isLoadingAvert &&
      !errorMessage &&
      families.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Nenhuma meta Avert com familia foi encontrada.
          </CardContent>
        </Card>
      ) : null}

      {canInspectAnomalies && !isLoadingAvert && !errorMessage ? (
        <AvertAnomaliesCard anomalies={anomalies} />
      ) : null}

      {canConsultFamilies && !isLoadingAvert && !errorMessage && families.length > 0 ? (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Familias monitoradas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Selecione uma familia para abrir a lista completa de produtos.
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {families.length} familias
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {families.map((family, index) => (
                <FamilyCard
                  key={family.family}
                  family={family}
                  tone={getFamilyTone(index)}
                  isSelected={family.family === selectedFamily?.family}
                  showSales={canConsultSales}
                  onSelect={() => setSelectedFamilyName(family.family)}
                />
              ))}
            </div>
          </section>

          {selectedFamily ? (
            <SelectedFamilyItems
              family={selectedFamily}
              tone={getFamilyTone(selectedFamilyIndex)}
              showSales={canConsultSales}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
