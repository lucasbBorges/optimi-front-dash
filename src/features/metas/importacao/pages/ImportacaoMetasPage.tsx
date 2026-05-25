import { useState } from "react"
import { ArrowLeft, CheckCircle, FileSpreadsheet, MapPinned } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ImportacaoMetasUploader } from "../components/ImportacaoMetasUploader"
import type { EstadoMetaImportacao } from "../types"

const stateOptions: Array<{
  value: EstadoMetaImportacao
  label: string
  description: string
}> = [
  {
    value: "RS",
    label: "Rio Grande do Sul",
    description: "Importar metas Avert para o estado do RS.",
  },
  {
    value: "SC",
    label: "Santa Catarina",
    description: "Importar metas Avert para o estado de SC.",
  },
]

export default function ImportacaoMetasPage() {
  const [estadoSelecionado, setEstadoSelecionado] =
    useState<EstadoMetaImportacao | null>(null)
  const [hasImportedData, setHasImportedData] = useState(false)

  return (
    <div className="flex flex-col gap-4 pb-4">
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
              Importar metas por item
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Baixe o modelo, preencha os dados de codprod, qt e vlr, depois
              importe o arquivo para validar e enviar.
            </p>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
        <CardHeader className="pb-3">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <FileSpreadsheet className="size-4" />
            <CardTitle className="text-base">Formato esperado</CardTitle>
          </div>
          <CardDescription>
            A primeira aba do XLSX sera lida e validada antes do envio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/70 bg-background/80 text-center text-sm font-semibold">
            <div className="border-r border-border/70 px-3 py-2">codprod</div>
            <div className="border-r border-border/70 px-3 py-2">qt</div>
            <div className="px-3 py-2">vlr</div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 md:grid-cols-2">
        {stateOptions.map((option) => {
          const isSelected = estadoSelecionado === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={hasImportedData}
              className={`rounded-2xl border p-4 text-left shadow-sm transition-colors ${
                isSelected
                  ? "border-primary/50 bg-primary/8"
                  : hasImportedData
                    ? "cursor-not-allowed border-border/70 bg-muted/30 opacity-60"
                  : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
              onClick={() => {
                if (!hasImportedData) {
                  setEstadoSelecionado(option.value)
                }
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                    <MapPinned className="size-3.5" />
                    {option.value}
                  </span>
                  <div className="space-y-1">
                    <p className="text-base font-semibold">{option.label}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
                {isSelected ? (
                  <CheckCircle className="size-5 shrink-0 text-primary" />
                ) : null}
              </div>
            </button>
          )
        })}
      </section>

      {hasImportedData ? (
        <Card className="border-primary/20 bg-primary/8">
          <CardContent className="p-4 text-sm text-primary">
            Estado travado apos a importacao do arquivo. Para trocar o estado,
            finalize ou limpe a importacao atual.
          </CardContent>
        </Card>
      ) : null}

      {estadoSelecionado ? (
        <ImportacaoMetasUploader
          estado={estadoSelecionado}
          onImportedDataChange={setHasImportedData}
        />
      ) : (
        <Card className="border-border/70">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Selecione o estado antes de baixar ou importar o arquivo XLSX.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
