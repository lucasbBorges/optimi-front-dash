import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"

const LoginSchema = z.object({
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(3, "Minimo de 3 caracteres"),
  remember: z.boolean().optional(),
})

type LoginInput = {
  email: string
  password: string
  remember?: boolean
}

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const { login, isAuthenticated, isLoggingIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "lucas.bortoliborges@gmail.com",
      password: "123",
      remember: true,
    },
    mode: "onTouched",
  })

  const redirectTo =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/"

  async function onSubmit(values: LoginInput) {
    setLoginError("")
    const result = await login(values)

    if (!result.success) {
      setLoginError(result.message ?? "Nao foi possivel entrar.")
      return
    }

    navigate(redirectTo, { replace: true })
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 text-foreground md:px-6">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg">
          <CardContent className="flex h-full flex-col justify-between gap-8 p-6 md:p-8">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                Area autenticada
              </span>

              <div className="space-y-3">
                <p className="text-sm font-medium text-primary">
                  Plataforma comercial
                </p>
                <h1 className="max-w-md text-3xl font-bold tracking-tight md:text-4xl">
                  Entre para acompanhar clientes, pedidos e resultados.
                </h1>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                  Um acesso rapido para consultar o desempenho da carteira,
                  operacao recente e sinais de oportunidade em um unico fluxo.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Clientes
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight">Top 10</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Maiores compradores e potenciais retomadas.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Pedidos
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight">30 dias</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Status de faturamento, envio e entrega.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Dashboard
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight">Ao vivo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leitura executiva do faturamento corrente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-lg">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Login</p>
              <h2 className="text-2xl font-semibold tracking-tight">Entrar</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Informe suas credenciais para acessar o ambiente.
              </p>
            </div>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 grid gap-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-xl border-border/70 bg-background pl-9 text-base"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-11 rounded-xl border-border/70 bg-background pl-9 pr-10 text-base"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2 top-1/2 rounded-md p-2 -translate-y-1/2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {loginError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {loginError}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-11 rounded-xl text-base"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Entrando..." : "Entrar"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
