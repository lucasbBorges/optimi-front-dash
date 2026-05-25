import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart4,
  ClipboardList,
  Target,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const goalCards = [
  {
    to: "/metas/geral",
    title: "Metas Geral",
    description:
      "Cadastre metas consolidadas para acompanhamento comercial da empresa.",
    eyebrow: "Meta consolidada",
    icon: BarChart4,
    tone: "text-teal-700 bg-teal-500/10 border-teal-500/30 dark:text-teal-300",
  },
  {
    to: "/metas/avert",
    title: "Metas Avert",
    description:
      "Cadastre metas especificas para o acompanhamento do canal Avert.",
    eyebrow: "Meta Avert",
    icon: ClipboardList,
    tone: "text-amber-700 bg-amber-500/10 border-amber-500/30 dark:text-amber-300",
  },
]

export default function Metas() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Administracao</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Cadastro de Metas
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Escolha o tipo de meta para cadastrar e acompanhar os objetivos
              comerciais do periodo.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
          <CardHeader className="pb-3">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Target className="size-4" />
              <CardTitle className="text-base">Modulo de metas</CardTitle>
            </div>
            <CardDescription>
              Area disponivel apenas para administradores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os cards abaixo direcionam para os cadastros separados por origem
              da meta.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        {goalCards.map(({ to, title, description, eyebrow, icon: Icon, tone }) => (
          <Link key={to} to={to} className="group block">
            <Card className="h-full border-border/70 transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${tone}`}
                  >
                    <Icon className="size-3.5" />
                    {eyebrow}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <CardTitle className="pt-3 text-xl">{title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  )
}
