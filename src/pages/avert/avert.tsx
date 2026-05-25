import {
  Activity,
  Boxes,
  CircleDollarSign,
  Layers3,
  PackageCheck,
  PackageOpen,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AvertProductItem = {
  code: number
  name: string
  quantity: number
  amount: number
}

type AvertProductFamily = {
  name: string
  tone: "teal" | "amber" | "cyan" | "emerald" | "rose"
  items: AvertProductItem[]
}

const productFamilies: AvertProductFamily[] = [
  {
    name: "Omega",
    tone: "teal",
    items: [
      { code: 8101, name: "Omega 3 TG 1000mg", quantity: 184, amount: 46200 },
      { code: 8102, name: "Omega 3 Kids", quantity: 76, amount: 13480 },
      { code: 8103, name: "Omega DHA", quantity: 58, amount: 10970 },
    ],
  },
  {
    name: "Medicamentos",
    tone: "amber",
    items: [
      { code: 8201, name: "Vitamina D3 2000UI", quantity: 232, amount: 31590 },
      { code: 8202, name: "Complexo B", quantity: 141, amount: 18270 },
      { code: 8203, name: "Melatonina", quantity: 89, amount: 16780 },
    ],
  },
  {
    name: "Gastro",
    tone: "cyan",
    items: [
      { code: 8301, name: "Probio Flora", quantity: 124, amount: 22420 },
      { code: 8302, name: "Digest Plus", quantity: 96, amount: 15560 },
      { code: 8303, name: "Fiber Care", quantity: 72, amount: 11880 },
    ],
  },
  {
    name: "Long Care",
    tone: "emerald",
    items: [
      { code: 8401, name: "Colageno UC-II", quantity: 116, amount: 28680 },
      { code: 8402, name: "Coenzima Q10", quantity: 83, amount: 21430 },
      { code: 8403, name: "Magnesio Senior", quantity: 67, amount: 13735 },
    ],
  },
]

const toneClasses: Record<
  AvertProductFamily["tone"],
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

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function getFamilyAmount(family: AvertProductFamily) {
  return family.items.reduce((total, item) => total + item.amount, 0)
}

function getFamilyQuantity(family: AvertProductFamily) {
  return family.items.reduce((total, item) => total + item.quantity, 0)
}

function getTotalAmount(families: AvertProductFamily[]) {
  return families.reduce((total, family) => total + getFamilyAmount(family), 0)
}

function getTotalQuantity(families: AvertProductFamily[]) {
  return families.reduce((total, family) => total + getFamilyQuantity(family), 0)
}

function getTotalItems(families: AvertProductFamily[]) {
  return families.reduce((total, family) => total + family.items.length, 0)
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

function FamilyCard({
  family,
  totalAmount,
}: {
  family: AvertProductFamily
  totalAmount: number
}) {
  const amount = getFamilyAmount(family)
  const quantity = getFamilyQuantity(family)
  const share = totalAmount > 0 ? Math.round((amount * 1000) / totalAmount) / 10 : 0
  const tone = toneClasses[family.tone]
  const topItem = [...family.items].sort(
    (left, right) => right.amount - left.amount
  )[0]

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tone.badge}`}
          >
            <Layers3 className="size-3.5" />
            {family.name}
          </span>
          <PackageCheck className={`size-4 ${tone.icon}`} />
        </div>
        <CardTitle className="pt-2 text-xl">{formatCurrency(amount)}</CardTitle>
        <CardDescription>
          {quantity} unidades em {family.items.length} itens monitorados.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Participacao no total</span>
            <span className="font-semibold">{share}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${tone.bar}`}
              style={{ width: `${Math.min(share, 100)}%` }}
            />
          </div>
        </div>

        {topItem ? (
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Principal item
            </p>
            <p className="mt-1 text-sm font-semibold">{topItem.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(topItem.amount)} em {topItem.quantity} unidades.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          {family.items.map((item) => {
            const itemShare = amount > 0 ? Math.round((item.amount * 1000) / amount) / 10 : 0

            return (
              <div
                key={item.code}
                className="rounded-xl border border-border/70 bg-background/80 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Codigo {item.code}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} un.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${tone.bar}`}
                      style={{ width: `${Math.min(itemShare, 100)}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-medium">
                    {itemShare}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Avert() {
  const totalAmount = getTotalAmount(productFamilies)
  const totalQuantity = getTotalQuantity(productFamilies)
  const totalItems = getTotalItems(productFamilies)

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
              Visao por familia, total vendido e detalhamento por item.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
          <CardHeader className="pb-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Activity className="size-3.5" />
                Consolidado Avert
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {productFamilies.length} familias
              </span>
            </div>
            <CardTitle className="text-base">Resumo por agrupamento</CardTitle>
            <CardDescription>
              Totais consolidados a partir dos itens de cada familia.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              title="Total"
              value={formatCurrency(totalAmount)}
              description="Valor consolidado das familias Avert."
              icon={CircleDollarSign}
            />
            <MetricCard
              title="Familias"
              value={String(productFamilies.length)}
              description="Agrupamentos comerciais monitorados."
              icon={Layers3}
            />
            <MetricCard
              title="Itens"
              value={String(totalItems)}
              description={`${totalQuantity} unidades distribuidas por item.`}
              icon={Boxes}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {productFamilies.map((family) => (
          <FamilyCard
            key={family.name}
            family={family}
            totalAmount={totalAmount}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <PackageOpen className="mt-0.5 size-4 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Quando a API de Avert estiver disponivel, substitua a lista local de
            familias por um hook de consulta mantendo o mesmo formato de dados.
          </p>
        </div>
      </section>
    </div>
  )
}
