import { useMemo, useState } from "react"
import {
  Activity,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Layers3,
  PackageCheck,
  PackageOpen,
  Search,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

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
      { code: 8104, name: "Omega 3 Ultra", quantity: 132, amount: 38280 },
      { code: 8105, name: "Omega EPA", quantity: 88, amount: 17690 },
      { code: 8106, name: "Omega 3 Mulher", quantity: 64, amount: 12440 },
      { code: 8107, name: "Omega 3 Senior", quantity: 119, amount: 27710 },
      { code: 8108, name: "Omega Plus Caps", quantity: 97, amount: 21860 },
      { code: 8109, name: "Omega 3 Veg", quantity: 41, amount: 9340 },
      { code: 8110, name: "Omega Cardio", quantity: 106, amount: 25870 },
      { code: 8111, name: "Omega Balance", quantity: 73, amount: 15190 },
      { code: 8112, name: "Omega Concentrado", quantity: 51, amount: 14260 },
    ],
  },
  {
    name: "Medicamentos",
    tone: "amber",
    items: [
      { code: 8201, name: "Vitamina D3 2000UI", quantity: 232, amount: 31590 },
      { code: 8202, name: "Complexo B", quantity: 141, amount: 18270 },
      { code: 8203, name: "Melatonina", quantity: 89, amount: 16780 },
      { code: 8204, name: "Zinco Quelato", quantity: 128, amount: 15360 },
      { code: 8205, name: "Vitamina C", quantity: 214, amount: 21390 },
      { code: 8206, name: "Ferro Bisglicinato", quantity: 84, amount: 11980 },
      { code: 8207, name: "Calcio D3", quantity: 102, amount: 16870 },
      { code: 8208, name: "Multivitaminico", quantity: 156, amount: 32760 },
      { code: 8209, name: "Imuno Care", quantity: 91, amount: 17410 },
      { code: 8210, name: "Sono Plus", quantity: 75, amount: 13850 },
      { code: 8211, name: "Energia B12", quantity: 118, amount: 15730 },
      { code: 8212, name: "D3 Kids", quantity: 63, amount: 8370 },
    ],
  },
  {
    name: "Gastro",
    tone: "cyan",
    items: [
      { code: 8301, name: "Probio Flora", quantity: 124, amount: 22420 },
      { code: 8302, name: "Digest Plus", quantity: 96, amount: 15560 },
      { code: 8303, name: "Fiber Care", quantity: 72, amount: 11880 },
      { code: 8304, name: "Lacto Balance", quantity: 83, amount: 13780 },
      { code: 8305, name: "Gastro Calm", quantity: 68, amount: 10420 },
      { code: 8306, name: "Enzima Digestiva", quantity: 101, amount: 16890 },
      { code: 8307, name: "Prebio Daily", quantity: 57, amount: 8970 },
      { code: 8308, name: "Flora Kids", quantity: 49, amount: 7990 },
      { code: 8309, name: "Intesti Care", quantity: 90, amount: 14850 },
      { code: 8310, name: "Gastro Defense", quantity: 62, amount: 12840 },
      { code: 8311, name: "Fiber Plus", quantity: 112, amount: 17640 },
      { code: 8312, name: "Probio Senior", quantity: 74, amount: 15120 },
    ],
  },
  {
    name: "Long Care",
    tone: "emerald",
    items: [
      { code: 8401, name: "Colageno UC-II", quantity: 116, amount: 28680 },
      { code: 8402, name: "Coenzima Q10", quantity: 83, amount: 21430 },
      { code: 8403, name: "Magnesio Senior", quantity: 67, amount: 13735 },
      { code: 8404, name: "Colageno Verisol", quantity: 94, amount: 24720 },
      { code: 8405, name: "Articulacao Plus", quantity: 71, amount: 18390 },
      { code: 8406, name: "Memoria Care", quantity: 65, amount: 14780 },
      { code: 8407, name: "Q10 Ultra", quantity: 58, amount: 19640 },
      { code: 8408, name: "Magnesio Dimalato", quantity: 107, amount: 18730 },
      { code: 8409, name: "Senior Multi", quantity: 81, amount: 16420 },
      { code: 8410, name: "Mobility Care", quantity: 52, amount: 12580 },
      { code: 8411, name: "Colageno Peptideos", quantity: 76, amount: 20490 },
      { code: 8412, name: "Longevidade Plus", quantity: 45, amount: 11860 },
    ],
  },
  {
    name: "Imunidade",
    tone: "rose",
    items: [
      { code: 8501, name: "Imuno Defense", quantity: 137, amount: 25640 },
      { code: 8502, name: "Beta Glucana", quantity: 82, amount: 17480 },
      { code: 8503, name: "Propolis Spray", quantity: 118, amount: 10420 },
      { code: 8504, name: "Vitamina C Kids", quantity: 96, amount: 9310 },
      { code: 8505, name: "D3 K2", quantity: 77, amount: 15330 },
      { code: 8506, name: "Zinco Cobre", quantity: 69, amount: 9870 },
      { code: 8507, name: "Imuno Senior", quantity: 54, amount: 12860 },
      { code: 8508, name: "Respira Care", quantity: 61, amount: 11820 },
      { code: 8509, name: "C Defense", quantity: 143, amount: 15920 },
      { code: 8510, name: "Imuno Daily", quantity: 88, amount: 16470 },
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
  isSelected,
  onSelect,
}: {
  family: AvertProductFamily
  totalAmount: number
  isSelected: boolean
  onSelect: () => void
}) {
  const amount = getFamilyAmount(family)
  const quantity = getFamilyQuantity(family)
  const share = totalAmount > 0 ? Math.round((amount * 1000) / totalAmount) / 10 : 0
  const tone = toneClasses[family.tone]
  const topItem = [...family.items].sort(
    (left, right) => right.amount - left.amount
  )[0]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border bg-card text-left shadow-sm transition-colors ${
        isSelected
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border/70 hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tone.badge}`}
          >
            <Layers3 className="size-3.5" />
            {family.name}
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
              {formatCurrency(amount)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {family.items.length} itens, {quantity} unidades.
            </p>
          </div>
          <PackageCheck className={`mt-1 size-4 ${tone.icon}`} />
        </div>
        <div className="space-y-2">
          <div className="mt-4 flex items-center justify-between text-xs">
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
          <div className="mt-4 rounded-xl bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Principal item
            </p>
            <p className="mt-1 text-sm font-semibold">{topItem.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(topItem.amount)} em {topItem.quantity} unidades.
            </p>
          </div>
        ) : null}
      </div>
    </button>
  )
}

function SelectedFamilyItems({
  family,
}: {
  family: AvertProductFamily
}) {
  const [search, setSearch] = useState("")
  const amount = getFamilyAmount(family)
  const quantity = getFamilyQuantity(family)
  const tone = toneClasses[family.tone]
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) {
      return family.items
    }

    return family.items.filter((item) => {
      return (
        item.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        String(item.code).includes(normalizedSearch)
      )
    })
  }, [family.items, normalizedSearch])

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tone.badge}`}
            >
              <PackageOpen className="size-3.5" />
              Itens da familia
            </span>
            <div>
              <CardTitle className="text-xl">{family.name}</CardTitle>
              <CardDescription>
                Lista completa da familia selecionada.
              </CardDescription>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-right">
            <div className="rounded-xl bg-muted/40 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </p>
              <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Unidades
              </p>
              <p className="text-sm font-semibold">{quantity}</p>
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
            placeholder="Buscar por item ou codigo"
            className="pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70">
          <div className="grid grid-cols-[1fr_84px_104px] gap-3 bg-muted/50 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span>Item</span>
            <span className="text-right">Qtd.</span>
            <span className="text-right">Valor</span>
          </div>

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const itemShare =
                amount > 0 ? Math.round((item.amount * 1000) / amount) / 10 : 0

              return (
                <div
                  key={item.code}
                  className="border-t border-border/70 bg-background px-3 py-3"
                >
                  <div className="grid grid-cols-[1fr_84px_104px] items-start gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Codigo {item.code}
                      </p>
                    </div>
                    <p className="text-right text-sm font-medium">
                      {item.quantity}
                    </p>
                    <p className="text-right text-sm font-semibold">
                      {formatCurrency(item.amount)}
                    </p>
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
            })
          ) : (
            <div className="border-t border-border/70 bg-background px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum item encontrado nesta familia.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Avert() {
  const [selectedFamilyName, setSelectedFamilyName] = useState(
    productFamilies[0]?.name ?? ""
  )
  const totalAmount = getTotalAmount(productFamilies)
  const totalQuantity = getTotalQuantity(productFamilies)
  const totalItems = getTotalItems(productFamilies)
  const selectedFamily =
    productFamilies.find((family) => family.name === selectedFamilyName) ??
    productFamilies[0]

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

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Familias monitoradas
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione uma familia para abrir a lista completa de itens.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {productFamilies.length} familias
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {productFamilies.map((family) => (
            <FamilyCard
              key={family.name}
              family={family}
              totalAmount={totalAmount}
              isSelected={family.name === selectedFamily?.name}
              onSelect={() => setSelectedFamilyName(family.name)}
            />
          ))}
        </div>
      </section>

      {selectedFamily ? <SelectedFamilyItems family={selectedFamily} /> : null}

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
