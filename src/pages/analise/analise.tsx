

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
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
import { useAuth } from "@/lib/auth"
import { getBillingScopeLabel } from "@/lib/billing-scope"
import {
  getPotentialCustomersErrorMessage,
  usePotentialCustomers,
  type PotentialCustomerItem,
} from "@/lib/potential-customers"
import {
  getTopCustomersErrorMessage,
  useTopCustomers,
  type TopCustomerItem,
} from "@/lib/top-customers"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function getTotalRevenue(clients: TopCustomerItem[]) {
  return clients.reduce((total, client) => total + client.amount, 0)
}

function getTotalDifference(clients: PotentialCustomerItem[]) {
  return clients.reduce((total, client) => total + client.difference, 0)
}

function ClientRow({
  index,
  client,
}: {
  index: number
  client: TopCustomerItem
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
              #{index}
            </span>
            <p className="text-sm font-semibold leading-tight text-foreground">
              {client.customerName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="size-3.5" />
            <span>Codigo {client.customerCode}</span>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-emerald-500/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Faturado
          </p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(client.amount)}
          </p>
        </div>
      </div>
    </div>
  )
}

function PotentialClientRow({
  index,
  client,
}: {
  index: number
  client: PotentialCustomerItem
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-amber-500/15 px-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
              #{index}
            </span>
            <p className="text-sm font-semibold leading-tight text-foreground">
              {client.customerName}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="size-3.5" />
            <span>Codigo {client.customerCode}</span>
          </div>
        </div>

        <div className="shrink-0 rounded-xl bg-rose-500/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-rose-700 dark:text-rose-300">
            Queda
          </p>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
            {formatCurrency(client.difference)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Analise() {
  const { currentUser } = useAuth()
  const topCustomersQuery = useTopCustomers(currentUser)
  const potentialCustomersQuery = usePotentialCustomers(currentUser)
  const canLoadTopCustomers =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"
  const canLoadPotentialCustomers =
    currentUser?.role === "representante" ||
    currentUser?.role === "supervisor" ||
    currentUser?.role === "admin"
  const topClients = topCustomersQuery.data?.customers ?? []
  const potentialClients = potentialCustomersQuery.data?.customers ?? []
  const totalRevenue = getTotalRevenue(topClients)
  const totalDifference = getTotalDifference(potentialClients)
  const topCustomersErrorMessage = topCustomersQuery.isError
    ? getTopCustomersErrorMessage(topCustomersQuery.error)
    : null
  const potentialCustomersErrorMessage = potentialCustomersQuery.isError
    ? getPotentialCustomersErrorMessage(potentialCustomersQuery.error)
    : null
  const topCustomersScopeLabel = getBillingScopeLabel(
    currentUser,
    topCustomersQuery.data?.representativeCode
  )
  const potentialCustomersScopeLabel = getBillingScopeLabel(
    currentUser,
    potentialCustomersQuery.data?.representativeCode
  )

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Analise comercial</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Top Clientes</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Visao resumida com os principais clientes faturados no recorte
              recente e os clientes com maior sinal de recuperacao.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <TrendingUp className="size-3.5" />
                  Melhores clientes
                </span>
                <ArrowUpRight className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Ultimos 3 meses</CardTitle>
              <CardDescription>
                Leitura da API de top clientes por usuario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {topCustomersQuery.isLoading
                  ? "Carregando..."
                  : topClients.length > 0
                    ? formatCurrency(totalRevenue)
                    : "Sem dados"}
              </p>
              <p className="text-xs text-muted-foreground">
                {topCustomersErrorMessage ??
                  "Soma faturada pelos principais clientes do periodo."}
              </p>
              {topCustomersScopeLabel ? (
                <p className="text-xs font-medium text-primary/80">
                  Consulta aplicada para {topCustomersScopeLabel}.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <TrendingDown className="size-3.5" />
                  Clientes em potencial
                </span>
                <ArrowDownRight className="size-4 text-amber-700 dark:text-amber-300" />
              </div>
              <CardTitle className="text-base">Recuperacao comercial</CardTitle>
              <CardDescription>
                Leitura da API de clientes em potencial por usuario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold tracking-tight">
                {potentialCustomersQuery.isLoading
                  ? "Carregando..."
                  : potentialClients.length > 0
                    ? formatCurrency(totalDifference)
                    : "Sem dados"}
              </p>
              <p className="text-xs text-muted-foreground">
                {potentialCustomersErrorMessage ??
                  "Diferenca acumulada de faturamento perdida no recorte."}
              </p>
              {potentialCustomersScopeLabel ? (
                <p className="text-xs font-medium text-amber-700/90 dark:text-amber-300">
                  Consulta aplicada para {potentialCustomersScopeLabel}.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="size-4 text-primary" />
              <CardTitle className="text-lg">Melhores clientes</CardTitle>
            </div>
            <CardDescription>
              Ranking dos melhores clientes dos últimos 90 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canLoadTopCustomers ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                O endpoint de top clientes esta disponivel apenas para representantes, supervisores e administradores.
              </div>
            ) : null}

            {canLoadTopCustomers && topCustomersQuery.isLoading ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                <p className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Buscando top clientes do usuario na API.
                </p>
              </div>
            ) : null}

            {canLoadTopCustomers &&
            !topCustomersQuery.isLoading &&
            topClients.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                Nenhum cliente retornado para este usuario no periodo.
              </div>
            ) : null}

            {canLoadTopCustomers
              ? topClients.map((client, index) => (
                <ClientRow
                  key={client.customerCode}
                  index={index + 1}
                  client={client}
                />
              ))
              : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-amber-700 dark:text-amber-300" />
              <CardTitle className="text-lg">Melhores clientes em potencial</CardTitle>
            </div>
            <CardDescription>
              Ranking dos clientes com maiores quedas de faturamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canLoadPotentialCustomers ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                O endpoint de clientes em potencial esta disponivel apenas para representantes, supervisores e administradores.
              </div>
            ) : null}

            {canLoadPotentialCustomers && potentialCustomersQuery.isLoading ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                <p className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Buscando clientes em potencial do usuario na API.
                </p>
              </div>
            ) : null}

            {canLoadPotentialCustomers &&
            !potentialCustomersQuery.isLoading &&
            potentialClients.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                Nenhum cliente em potencial retornado para este usuario no periodo.
              </div>
            ) : null}

            {canLoadPotentialCustomers
              ? potentialClients.map((client, index) => (
                <PotentialClientRow
                  key={client.customerCode}
                  index={index + 1}
                  client={client}
                />
              ))
              : null}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
