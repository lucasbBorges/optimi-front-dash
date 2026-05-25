import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Pencil,
  Plus,
  Save,
  Search,
  Target,
  Trash2,
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
import { Label } from "@/components/ui/label"

type Goal = {
  id: number
  supervisor: string
  praca: string
  ano: number
  mes: number
  codfornec: number
  fantasia: string
  meta: number
}

type FilterValues = {
  ano: string
  mes: string
  supervisor: string
  praca: string
}

type GoalFormState = {
  ano: string
  mes: string
  supervisor: string
  praca: string
  codfornec: string
  fantasia: string
  meta: string
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 4 }, (_, index) =>
  String(currentYear + 1 - index)
)
const monthOptions = Array.from({ length: 12 }, (_, index) =>
  String(index + 1)
)
const supervisorOptions = ["RS1", "SC1", "TO"]
const pracaOptions = ["PORTO ALEGRE", "FLORIANOPOLIS", "PALMAS", "JOINVILLE"]

const emptyFilters: FilterValues = {
  ano: "",
  mes: "",
  supervisor: "",
  praca: "",
}

const emptyForm: GoalFormState = {
  ano: "",
  mes: "",
  supervisor: "",
  praca: "",
  codfornec: "",
  fantasia: "",
  meta: "",
}

const initialGoals: Goal[] = [
  {
    id: 1,
    ano: currentYear,
    mes: 1,
    supervisor: "RS1",
    praca: "PORTO ALEGRE",
    codfornec: 101,
    fantasia: "Fornecedor Alpha",
    meta: 125000,
  },
  {
    id: 2,
    ano: currentYear,
    mes: 2,
    supervisor: "SC1",
    praca: "FLORIANOPOLIS",
    codfornec: 204,
    fantasia: "Fornecedor Beta",
    meta: 98000,
  },
  {
    id: 3,
    ano: currentYear,
    mes: 3,
    supervisor: "TO",
    praca: "PALMAS",
    codfornec: 317,
    fantasia: "Fornecedor Gama",
    meta: 76000,
  },
]

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function toCurrencyValue(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."))
}

function SelectField({
  id,
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  placeholder: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function Modal({
  title,
  description,
  open,
  children,
  onClose,
}: {
  title: string
  description: string
  open: boolean
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function MetasGeral() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [filters, setFilters] = useState<FilterValues>(emptyFilters)
  const [draftFilters, setDraftFilters] = useState<FilterValues>(emptyFilters)
  const [form, setForm] = useState<GoalFormState>(emptyForm)
  const [editValue, setEditValue] = useState("")
  const [newGoalOpen, setNewGoalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 5

  const filteredGoals = useMemo(
    () =>
      goals.filter((goal) => {
        const matchesYear = filters.ano ? goal.ano === Number(filters.ano) : true
        const matchesMonth = filters.mes ? goal.mes === Number(filters.mes) : true
        const matchesSupervisor = filters.supervisor
          ? goal.supervisor === filters.supervisor
          : true
        const matchesPraca = filters.praca ? goal.praca === filters.praca : true

        return matchesYear && matchesMonth && matchesSupervisor && matchesPraca
      }),
    [filters, goals]
  )

  const totalPages = Math.max(Math.ceil(filteredGoals.length / pageSize), 1)
  const visibleGoals = filteredGoals.slice(page * pageSize, (page + 1) * pageSize)
  const total = filteredGoals.reduce((sum, goal) => sum + goal.meta, 0)
  const canPrev = page > 0
  const canNext = page + 1 < totalPages

  function updateForm<K extends keyof GoalFormState>(
    field: K,
    value: GoalFormState[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateDraftFilter<K extends keyof FilterValues>(
    field: K,
    value: FilterValues[K]
  ) {
    setDraftFilters((current) => ({ ...current, [field]: value }))
  }

  function applyFilters() {
    setFilters(draftFilters)
    setPage(0)
  }

  function clearFilters() {
    setDraftFilters(emptyFilters)
    setFilters(emptyFilters)
    setPage(0)
  }

  function resetNewGoal() {
    setForm(emptyForm)
    setNewGoalOpen(false)
  }

  function createGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setGoals((current) => [
      {
        id: Date.now(),
        ano: Number(form.ano),
        mes: Number(form.mes),
        supervisor: form.supervisor,
        praca: form.praca,
        codfornec: Number(form.codfornec),
        fantasia: form.fantasia,
        meta: toCurrencyValue(form.meta),
      },
      ...current,
    ])
    resetNewGoal()
    setPage(0)
  }

  function openEdit(goal: Goal) {
    setEditGoal(goal)
    setEditValue(goal.meta.toFixed(2))
  }

  function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editGoal) {
      return
    }

    setGoals((current) =>
      current.map((goal) =>
        goal.id === editGoal.id
          ? { ...goal, meta: toCurrencyValue(editValue) }
          : goal
      )
    )
    setEditGoal(null)
    setEditValue("")
  }

  function confirmDelete() {
    if (!deleteGoal) {
      return
    }

    setGoals((current) => current.filter((goal) => goal.id !== deleteGoal.id))
    setDeleteGoal(null)
    setPage((current) => Math.min(current, Math.max(totalPages - 1, 0)))
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <Button asChild variant="ghost" className="w-fit px-0 text-primary">
          <Link to="/metas">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
        </Button>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Cadastro de metas</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Metas Geral</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cadastre e acompanhe metas por praca, regiao do vendedor e
              fornecedor.
            </p>
          </div>
        </div>
      </section>

      <Card className="border-border/70">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <CardTitle className="text-lg">Metas cadastradas</CardTitle>
          </div>
          <CardDescription>
            Listagem visual preparada para receber a integracao com o backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <Button
              type="button"
              className="h-11 rounded-xl xl:w-fit"
              onClick={() => setNewGoalOpen(true)}
            >
              <Plus className="size-4" />
              Cadastrar nova meta
            </Button>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[140px_140px_150px_180px_auto_auto]">
              <SelectField
                id="goal-filter-year"
                label="Ano"
                value={draftFilters.ano}
                placeholder="Ano"
                options={yearOptions}
                onChange={(value) => updateDraftFilter("ano", value)}
              />
              <SelectField
                id="goal-filter-month"
                label="Mes"
                value={draftFilters.mes}
                placeholder="Mes"
                options={monthOptions}
                onChange={(value) => updateDraftFilter("mes", value)}
              />
              <SelectField
                id="goal-filter-supervisor"
                label="Supervisor"
                value={draftFilters.supervisor}
                placeholder="Supervisor"
                options={supervisorOptions}
                onChange={(value) => updateDraftFilter("supervisor", value)}
              />
              <SelectField
                id="goal-filter-praca"
                label="Praca"
                value={draftFilters.praca}
                placeholder="Praca"
                options={pracaOptions}
                onChange={(value) => updateDraftFilter("praca", value)}
              />
              <Button
                type="button"
                className="h-11 rounded-xl self-end"
                onClick={applyFilters}
              >
                <Search className="size-4" />
                Filtrar
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-11 rounded-xl self-end"
                onClick={clearFilters}
              >
                <Filter className="size-4" />
                Limpar
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/70">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="px-4 py-3 text-left font-medium">Ano</th>
                    <th className="px-4 py-3 text-left font-medium">Mes</th>
                    <th className="px-4 py-3 text-left font-medium">
                      Supervisor
                    </th>
                    <th className="px-4 py-3 text-left font-medium">Praca</th>
                    <th className="px-4 py-3 text-center font-medium">
                      Codfornec
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      Fantasia
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Meta</th>
                    <th className="px-4 py-3 text-right font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleGoals.length > 0 ? (
                    visibleGoals.map((goal) => (
                      <tr
                        key={goal.id}
                        className="border-b border-border/70 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium">{goal.ano}</td>
                        <td className="px-4 py-3">{goal.mes}</td>
                        <td className="px-4 py-3">{goal.supervisor}</td>
                        <td className="px-4 py-3">{goal.praca}</td>
                        <td className="px-4 py-3 text-center">
                          {goal.codfornec}
                        </td>
                        <td className="px-4 py-3">{goal.fantasia}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(goal.meta)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openEdit(goal)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => setDeleteGoal(goal)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Nenhuma meta encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t border-border/70 bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-semibold" colSpan={6}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {filteredGoals.length > 0 ? formatCurrency(total) : "-"}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Pagina{" "}
              <span className="font-semibold text-foreground">{page + 1}</span>{" "}
              de <span className="font-semibold text-foreground">{totalPages}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={!canPrev}
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
              >
                <ChevronLeft className="size-4" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                disabled={!canNext}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages - 1))
                }
              >
                Proxima
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={newGoalOpen}
        title="Cadastrar meta"
        description="Informe periodo, praca, supervisor, fornecedor e valor da meta."
        onClose={resetNewGoal}
      >
        <form onSubmit={createGoal} className="grid gap-4 md:grid-cols-2">
          <SelectField
            id="goal-year"
            label="Ano"
            value={form.ano}
            placeholder="Selecione o ano"
            options={yearOptions}
            onChange={(value) => updateForm("ano", value)}
          />
          <SelectField
            id="goal-month"
            label="Mes"
            value={form.mes}
            placeholder="1 a 12"
            options={monthOptions}
            onChange={(value) => updateForm("mes", value)}
          />
          <SelectField
            id="goal-supervisor"
            label="Supervisor"
            value={form.supervisor}
            placeholder="Selecione o supervisor"
            options={supervisorOptions}
            onChange={(value) => updateForm("supervisor", value)}
          />
          <SelectField
            id="goal-praca"
            label="Praca"
            value={form.praca}
            placeholder="Selecione a praca"
            options={pracaOptions}
            onChange={(value) => updateForm("praca", value)}
          />
          <div className="grid gap-2">
            <Label htmlFor="goal-supplier-code">Codigo do fornecedor</Label>
            <Input
              id="goal-supplier-code"
              type="number"
              inputMode="numeric"
              required
              className="h-11 rounded-xl"
              placeholder="Ex.: 12345"
              value={form.codfornec}
              onChange={(event) => updateForm("codfornec", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal-supplier-name">Fantasia</Label>
            <Input
              id="goal-supplier-name"
              required
              className="h-11 rounded-xl"
              placeholder="Nome fantasia do fornecedor"
              value={form.fantasia}
              onChange={(event) => updateForm("fantasia", event.target.value)}
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="goal-value">Meta</Label>
            <Input
              id="goal-value"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              className="h-11 rounded-xl"
              placeholder="Ex.: 1000.00"
              value={form.meta}
              onChange={(event) => updateForm("meta", event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2 md:col-span-2 sm:flex-row">
            <Button type="submit" className="h-11 rounded-xl">
              <Save className="size-4" />
              Salvar
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 rounded-xl"
              onClick={resetNewGoal}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(editGoal)}
        title="Alterar meta"
        description="Apenas o valor da meta sera atualizado."
        onClose={() => setEditGoal(null)}
      >
        <div className="mb-4 grid gap-2 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            Supervisor:{" "}
            <span className="font-semibold text-foreground">
              {editGoal?.supervisor ?? "-"}
            </span>
          </p>
          <p>
            Praca:{" "}
            <span className="font-semibold text-foreground">
              {editGoal?.praca ?? "-"}
            </span>
          </p>
          <p>
            Periodo:{" "}
            <span className="font-semibold text-foreground">
              {editGoal ? `${editGoal.mes}/${editGoal.ano}` : "-"}
            </span>
          </p>
          <p>
            Fornecedor:{" "}
            <span className="font-semibold text-foreground">
              {editGoal
                ? `${editGoal.codfornec} - ${editGoal.fantasia}`
                : "-"}
            </span>
          </p>
        </div>
        <form onSubmit={saveEdit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-goal-value">Meta (R$)</Label>
            <Input
              id="edit-goal-value"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              className="h-11 rounded-xl"
              placeholder="0.00"
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" className="h-11 rounded-xl">
              Salvar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setEditGoal(null)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteGoal)}
        title="Excluir meta?"
        description="Essa acao remove a meta da listagem visual atual."
        onClose={() => setDeleteGoal(null)}
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Voce esta prestes a excluir{" "}
            <span className="font-semibold text-foreground">
              {deleteGoal
                ? `${deleteGoal.supervisor} - ${deleteGoal.praca} - ${deleteGoal.mes}/${deleteGoal.ano}`
                : "esta meta"}
            </span>
            .
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              className="h-11 rounded-xl"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => setDeleteGoal(null)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
