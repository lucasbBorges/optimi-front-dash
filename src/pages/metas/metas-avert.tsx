import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function MetasAvert() {
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
            <h1 className="text-3xl font-bold tracking-tight">Metas Avert</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Informe os objetivos comerciais vinculados ao canal Avert.
            </p>
          </div>
        </div>
      </section>

      <Link to="/metas/avert/importacao" className="group block">
        <Card className="border-border/70 transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                <FileSpreadsheet className="size-3.5" />
                Importacao XLSX
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <CardTitle className="pt-3 text-xl">
              Importar metas por item
            </CardTitle>
            <CardDescription className="leading-relaxed">
              Importe um XLSX com codprod, quantidade e valor para metas Avert.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  )
}
