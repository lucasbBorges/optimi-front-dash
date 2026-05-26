import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  CircleDollarSign,
  ClipboardList,
  LoaderCircle,
  PackageCheck,
  Store,
  Trash2,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getMetasAvertErrorMessage,
  useDeleteMetasAvert,
  useMetasAvert,
  type MetaAvertGroup,
} from "@/lib/metas-avert"

type FeedbackMessage = {
  type: "success" | "error"
  title: string
  message: string
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
})

function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatMonth(month: number) {
  if (month < 1 || month > 12) {
    return `Mes ${month}`
  }

  const date = new Date(2026, month - 1, 1)

  return monthFormatter.format(date)
}

function getTotalQuantity(groups: MetaAvertGroup[]) {
  return groups.reduce((total, group) => total + group.qt, 0)
}

function getTotalValue(groups: MetaAvertGroup[]) {
  return groups.reduce((total, group) => total + group.vlr, 0)
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

function FeedbackPopup({
  feedback,
  onClose,
}: {
  feedback: FeedbackMessage | null
  onClose: () => void
}) {
  if (!feedback) {
    return null
  }

  const isSuccess = feedback.type === "success"

  return (
    <div className="fixed inset-x-4 top-4 z-[60] sm:left-auto sm:right-4 sm:w-[380px]">
      <div
        className={`rounded-2xl border bg-card p-4 shadow-lg ${
          isSuccess ? "border-emerald-500/30" : "border-destructive/30"
        }`}
      >
        <div className="flex items-start gap-3">
          {isSuccess ? (
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          ) : (
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{feedback.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {feedback.message}
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

function DeleteConfirmation({
  group,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  group: MetaAvertGroup | null
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!group) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-black/40 p-4 sm:items-center sm:justify-center">
      <Card className="w-full border-destructive/30 bg-card sm:max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                <Trash2 className="size-3.5" />
                Excluir metas
              </span>
              <CardTitle className="text-xl">
                {formatMonth(group.mes)} / {group.ano}
              </CardTitle>
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={onCancel}
              disabled={isDeleting}
              aria-label="Cancelar exclusao"
            >
              <X className="size-4" />
            </button>
          </div>
          <CardDescription>
            Esta acao remove todas as metas Avert cadastradas para este ano e
            mes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-xl"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Excluir metas
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function MetaGroupCard({
  group,
  onDelete,
  isDeleting,
}: {
  group: MetaAvertGroup
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <CalendarDays className="size-3.5" />
            {formatMonth(group.mes)} / {group.ano}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {group.totalItens} registros
          </span>
        </div>
        <CardTitle className="pt-2 text-xl">{formatCurrency(group.vlr)}</CardTitle>
        <CardDescription>
          Meta consolidada de todas as pracas do mes.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Pracas
          </p>
          <p className="mt-1 flex items-center gap-2 text-base font-semibold">
            <Store className="size-4 text-emerald-700 dark:text-emerald-300" />
            {group.totalPracas}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Quantidade
          </p>
          <p className="mt-1 text-base font-semibold">
            {formatQuantity(group.qt)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Valor
          </p>
          <p className="mt-1 text-base font-semibold">
            {formatCurrency(group.vlr)}
          </p>
        </div>
        <div className="sm:col-span-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Excluir metas do mes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MetasAvertConsulta() {
  const metasAvertQuery = useMetasAvert()
  const deleteMetasAvertMutation = useDeleteMetasAvert()
  const [groupToDelete, setGroupToDelete] = useState<MetaAvertGroup | null>(
    null
  )
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null)
  const groups = metasAvertQuery.data?.groups ?? []
  const errorMessage = metasAvertQuery.isError
    ? getMetasAvertErrorMessage(metasAvertQuery.error)
    : null

  return (
    <div className="flex flex-col gap-4 pb-4">
      <FeedbackPopup feedback={feedback} onClose={() => setFeedback(null)} />
      <DeleteConfirmation
        group={groupToDelete}
        isDeleting={deleteMetasAvertMutation.isPending}
        onCancel={() => setGroupToDelete(null)}
        onConfirm={async () => {
          if (!groupToDelete) {
            return
          }

          try {
            await deleteMetasAvertMutation.mutateAsync({
              ano: groupToDelete.ano,
              mes: groupToDelete.mes,
            })
            setFeedback({
              type: "success",
              title: "Metas excluidas",
              message: `As metas de ${formatMonth(groupToDelete.mes)} / ${groupToDelete.ano} foram removidas.`,
            })
            setGroupToDelete(null)
          } catch (error) {
            setFeedback({
              type: "error",
              title: "Erro ao excluir metas",
              message: getMetasAvertErrorMessage(error),
            })
          }
        }}
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
              Consultar metas
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Listagem consolidada por mes, somando todas as pracas.
            </p>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <CardHeader className="pb-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ClipboardList className="size-3.5" />
              Consolidado
            </span>
          </div>
          <CardTitle className="text-base">Resumo das metas</CardTitle>
          <CardDescription>
            Soma de quantidade e valor agrupada por ano e mes.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            title="Grupos"
            value={
              metasAvertQuery.isLoading ? "..." : String(groups.length)
            }
            description="Anos e meses consolidados."
            icon={CalendarDays}
          />
          <MetricCard
            title="Quantidade"
            value={
              metasAvertQuery.isLoading
                ? "..."
                : formatQuantity(getTotalQuantity(groups))
            }
            description="Soma de qt das metas retornadas."
            icon={PackageCheck}
          />
          <MetricCard
            title="Valor"
            value={
              metasAvertQuery.isLoading
                ? "..."
                : formatCurrency(getTotalValue(groups))
            }
            description="Soma de vlr das metas retornadas."
            icon={CircleDollarSign}
          />
        </CardContent>
      </Card>

      {metasAvertQuery.isLoading ? (
        <Card className="border-border/70">
          <CardContent className="p-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              Buscando metas Avert na API.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!metasAvertQuery.isLoading && errorMessage ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {errorMessage}
          </CardContent>
        </Card>
      ) : null}

      {!metasAvertQuery.isLoading && !errorMessage && groups.length === 0 ? (
        <Card className="border-border/70">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Nenhuma meta Avert cadastrada.
          </CardContent>
        </Card>
      ) : null}

      {!metasAvertQuery.isLoading && !errorMessage && groups.length > 0 ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {groups.map((group) => (
            <MetaGroupCard
              key={group.key}
              group={group}
              isDeleting={
                deleteMetasAvertMutation.isPending &&
                groupToDelete?.key === group.key
              }
              onDelete={() => setGroupToDelete(group)}
            />
          ))}
        </section>
      ) : null}
    </div>
  )
}
