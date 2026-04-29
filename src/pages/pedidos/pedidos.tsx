import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleX,
  LoaderCircle,
  PackageCheck,
  ReceiptText,
} from "lucide-react"

import { api } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ApiOrder = {
  customerName: string | null
  orderDate: string
  cancellationDate: string | null
  billingDate: string | null
  totalAmount: number | string | null
}

type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

type Order = {
  customerName: string
  orderDate: string
  cancelled: boolean
  cancelledAt: string | null
  invoiced: boolean
  invoicedAt: string | null
  value: number
}

type OrdersSummary = {
  totalOrders: number
  totalValue: number
  invoicedCount: number
  cancelledCount: number
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString("pt-BR")
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    const normalized = Number(value)
    return Number.isFinite(normalized) ? normalized : 0
  }

  return 0
}

function normalizeOrder(order: ApiOrder): Order {
  const invoicedAt = formatDateTime(order.billingDate)
  const cancelledAt = formatDateTime(order.cancellationDate)

  return {
    customerName: order.customerName?.trim() || "Cliente nao informado",
    orderDate: formatDateTime(order.orderDate) ?? "Data indisponivel",
    cancelled: Boolean(cancelledAt),
    cancelledAt,
    invoiced: Boolean(invoicedAt),
    invoicedAt,
    value: toNumber(order.totalAmount),
  }
}

function getOrdersErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data

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
      "detail" in responseData &&
      typeof responseData.detail === "string"
    ) {
      return responseData.detail
    }
  }

  return "Nao foi possivel carregar os pedidos."
}

function summarizeOrders(data: Order[]) {
  return {
    totalOrders: data.length,
    totalValue: data.reduce((sum, order) => sum + order.value, 0),
    invoicedCount: data.filter((order) => order.invoiced).length,
    cancelledCount: data.filter((order) => order.cancelled).length,
  } satisfies OrdersSummary
}

async function fetchOrdersPage(page: number, size: number) {
  const { data } = await api.get<PageResponse<ApiOrder>>("/orders", {
    params: { page, size },
  })

  return {
    ...data,
    content: data.content.map(normalizeOrder),
  }
}

function StatusBadge({
  active,
  trueLabel,
  falseLabel,
}: {
  active: boolean
  trueLabel: string
  falseLabel: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {active ? trueLabel : falseLabel}
    </span>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function OrderRow({ order, index }: { order: Order; index: number }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              Pedido {index + 1}
            </span>
            <p className="text-sm font-semibold leading-tight">
              {order.customerName}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {`Pedido realizado em ${order.orderDate}`}
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              active={order.invoiced}
              trueLabel="Faturado"
              falseLabel="Nao faturado"
            />
            <StatusBadge
              active={order.cancelled}
              trueLabel="Cancelado"
              falseLabel="Ativo"
            />
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-primary/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-primary">
            Valor
          </p>
          <p className="text-sm font-semibold text-primary">
            {formatCurrency(order.value)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <DetailItem label="Data do pedido" value={order.orderDate} />
        <DetailItem
          label="Data faturamento"
          value={order.invoicedAt ?? "Nao faturado"}
        />
        <DetailItem
          label="Data cancelamento"
          value={order.cancelledAt ?? "Nao cancelado"}
        />
      </div>
    </div>
  )
}

export default function Pedidos() {
  const [page, setPage] = useState(0)
  const size = 20

  const ordersQuery = useQuery({
    queryKey: ["orders", page, size],
    queryFn: async () => fetchOrdersPage(page, size),
    placeholderData: (previousData) => previousData,
    retry: false,
  })

  const ordersSummaryQuery = useQuery({
    queryKey: ["orders", "summary"],
    queryFn: async () => {
      const maxPageSize = 100
      const firstPage = await fetchOrdersPage(0, maxPageSize)

      let allOrders = [...firstPage.content]

      if (firstPage.totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
            fetchOrdersPage(index + 1, maxPageSize)
          )
        )

        allOrders = allOrders.concat(
          remainingPages.flatMap((response) => response.content)
        )
      }

      return summarizeOrders(allOrders)
    },
    retry: false,
  })

  const orders = useMemo(() => ordersQuery.data?.content ?? [], [ordersQuery.data])
  const summary = ordersSummaryQuery.data ?? summarizeOrders([])
  const errorMessage = ordersQuery.isError
    ? getOrdersErrorMessage(ordersQuery.error)
    : null
  const summaryErrorMessage = ordersSummaryQuery.isError
    ? getOrdersErrorMessage(ordersSummaryQuery.error)
    : null

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Operacao comercial</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Visao dos pedidos realizados nos ultimos 30 dias, com cliente,
              faturamento e cancelamento.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ReceiptText className="size-3.5" />
                  Ultimos 30 dias
                </span>
              </div>
              <CardTitle className="text-base">Pedidos na pagina</CardTitle>
              <CardDescription>
                Quantidade total de pedidos nos ultimos 30 dias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {ordersSummaryQuery.isLoading ? "..." : summary.totalOrders}
              </p>
              <p className="text-xs text-muted-foreground">
                {summaryErrorMessage ??
                  "Base completa para acompanhamento operacional."}
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <CircleDollarSign className="size-3.5" />
                  Valor total
                </span>
              </div>
              <CardTitle className="text-base">Volume movimentado</CardTitle>
              <CardDescription>
                Soma absoluta dos pedidos no periodo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {ordersSummaryQuery.isLoading
                  ? "..."
                  : formatCurrency(summary.totalValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Total consolidado de todas as paginas.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <PackageCheck className="size-3.5" />
                  Faturamento
                </span>
              </div>
              <CardTitle className="text-base">Pedidos faturados</CardTitle>
              <CardDescription>
                Pedidos que ja tiveram faturamento registrado.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {ordersSummaryQuery.isLoading ? "..." : summary.invoicedCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Quantidade pronta para acompanhamento financeiro.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  <CircleX className="size-3.5" />
                  Cancelamentos
                </span>
              </div>
              <CardTitle className="text-base">Pedidos cancelados</CardTitle>
              <CardDescription>
                Pedidos com data de cancelamento registrada.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {ordersSummaryQuery.isLoading ? "..." : summary.cancelledCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Operacoes que nao seguiram ativas no periodo.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <CardTitle className="text-lg">Pedidos recentes</CardTitle>
            </div>
            <CardDescription>
              Lista vinda da API com pedidos feitos nos ultimos 30 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersQuery.isLoading && (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" />
                  Buscando pedidos pela API.
                </p>
              </div>
            )}

            {!ordersQuery.isLoading && errorMessage && (
              <div className="rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            )}

            {!ordersQuery.isLoading && !errorMessage && orders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido encontrado nos ultimos 30 dias.
                </p>
              </div>
            )}

            {!ordersQuery.isLoading &&
              !errorMessage &&
              orders.map((order, index) => (
                <OrderRow
                  key={`${order.orderDate}-${index}`}
                  order={order}
                  index={page * size + index}
                />
              ))}

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {ordersQuery.data
                    ? `Pagina ${ordersQuery.data.page + 1} de ${Math.max(
                        ordersQuery.data.totalPages,
                        1
                      )}`
                    : "Pagina 1 de 1"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ordersQuery.data
                    ? `${ordersQuery.data.totalElements} pedidos encontrados nos ultimos 30 dias.`
                    : "Sem dados carregados."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                  disabled={ordersQuery.isLoading || Boolean(ordersQuery.data?.first)}
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={ordersQuery.isLoading || Boolean(ordersQuery.data?.last)}
                >
                  Proxima
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
