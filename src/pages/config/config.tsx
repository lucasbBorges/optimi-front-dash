import { useState } from "react"
import {
  BadgeCheck,
  Building2,
  Crown,
  LogOut,
  MapPinned,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react"

import { useAuth, type SupervisorState, type UserRole } from "@/lib/auth"
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

type FormState = {
  name: string
  email: string
  password: string
  role: UserRole
  representativeCode: string
  supervisorState: SupervisorState
}

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  role: "representante",
  representativeCode: "",
  supervisorState: "RS",
}

const roleOptions: Array<{
  label: string
  value: UserRole
  description: string
}> = [
  {
    label: "Representante",
    value: "representante",
    description: "Visualiza apenas o faturado da praça vinculada ao codigo do ERP.",
  },
  {
    label: "Supervisor",
    value: "supervisor",
    description: "Visualiza o faturado consolidado do estado.",
  },
  {
    label: "Admin",
    value: "admin",
    description: "Visualiza o resultado total da empresa e administra usuarios.",
  },
]

const supervisorStates: SupervisorState[] = ["RS", "SC", "TO"]

function getRoleLabel(role: UserRole) {
  if (role === "admin") {
    return "Admin"
  }

  if (role === "supervisor") {
    return "Supervisor"
  }

  return "Representante"
}

function getUserScopeDescription(user: {
  role: UserRole
  representativeCode: string | null
  supervisorState: SupervisorState | null
}) {
  if (user.role === "representante") {
    return `Codigo do representante: ${user.representativeCode}`
  }

  if (user.role === "supervisor") {
    return `Estado: ${user.supervisorState}`
  }

  return "Escopo: resultado da empresa"
}

export default function Config() {
  const {
    currentUser,
    users,
    usersPagination,
    setUsersPage,
    createUser,
    deleteUser,
    logout,
  } = useAuth()
  const [form, setForm] = useState<FormState>(initialFormState)
  const [feedback, setFeedback] = useState("")
  const [feedbackType, setFeedbackType] = useState<"success" | "error">(
    "success"
  )

  if (!currentUser) {
    return null
  }

  const isAdmin = currentUser.role === "admin"

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleRoleChange(role: UserRole) {
    setForm((current) => ({
      ...current,
      role,
      representativeCode: role === "representante" ? current.representativeCode : "",
      supervisorState: role === "supervisor" ? current.supervisorState : "RS",
    }))
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback("")

    const result = await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      representativeCode: form.role === "representante" ? form.representativeCode : undefined,
      supervisorState:
        form.role === "supervisor" ? form.supervisorState : undefined,
    })

    if (!result.success) {
      setFeedbackType("error")
      setFeedback(result.message ?? "Nao foi possivel criar o usuario.")
      return
    }

    setFeedbackType("success")
    setFeedback("Usuario criado com sucesso.")
    setForm(initialFormState)
  }

  async function handleDeleteUser(userId: string) {
    setFeedback("")
    const result = await deleteUser(userId)

    if (!result.success) {
      setFeedbackType("error")
      setFeedback(result.message ?? "Nao foi possivel excluir o usuario.")
      return
    }

    setFeedbackType("success")
    setFeedback("Usuario excluido com sucesso.")
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Administracao</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Painel Admin</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Gerencie usuarios por perfil, codigo do representante e abrangencia
              de visualizacao.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-background to-background">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <ShieldCheck className="size-3.5" />
                  Sessao atual
                </span>
              </div>
              <CardTitle className="text-base">Usuario logado</CardTitle>
              <CardDescription>
                Perfil ativo e escopo aplicado no ambiente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-sm font-semibold">{currentUser.email}</p>
              <p className="text-sm text-muted-foreground">
                {getRoleLabel(currentUser.role)}
              </p>
              <p className="text-sm text-muted-foreground">
                {getUserScopeDescription(currentUser)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Users className="size-4" />
                <CardTitle className="text-base">Usuarios cadastrados</CardTitle>
              </div>
            <CardDescription>
              Quantidade total de acessos retornados pela API.
            </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">
                {usersPagination.totalElements}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Exibindo {users.length} nesta pagina.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <div className="mb-3 flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <MapPinned className="size-4" />
                <CardTitle className="text-base">Escopo ativo</CardTitle>
              </div>
              <CardDescription>
                Nivel de leitura aplicado ao usuario autenticado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">
                {currentUser.role === "admin"
                  ? "Empresa"
                  : currentUser.role === "supervisor"
                    ? currentUser.supervisorState
                    : currentUser.representativeCode}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" />
              <CardTitle className="text-lg">Novo usuario</CardTitle>
            </div>
            <CardDescription>
              Cadastre representantes, supervisores e administradores no
              backend da aplicacao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAdmin ? (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Perfil</Label>
                  <div className="grid gap-2">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-2xl border p-4 text-left transition-colors ${
                          form.role === option.value
                            ? "border-primary/40 bg-primary/8"
                            : "border-border/70 bg-background/70 hover:bg-muted/40"
                        }`}
                        onClick={() => handleRoleChange(option.value)}
                      >
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-name">Nome</Label>
                  <Input
                    id="admin-name"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Nome do usuario"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-email">E-mail</Label>
                  <Input
                    id="admin-email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="novo.usuario@empresa.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-password">Senha</Label>
                  <Input
                    id="admin-password"
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Informe a senha"
                  />
                </div>

                {form.role === "representante" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="representative-code">Codigo do representante</Label>
                    <Input
                      id="representative-code"
                      value={form.representativeCode}
                      onChange={(event) =>
                        updateField("representativeCode", event.target.value)
                      }
                      className="h-11 rounded-xl"
                      placeholder="Ex.: 10234"
                    />
                  </div>
                ) : null}

                {form.role === "supervisor" ? (
                  <div className="grid gap-2">
                    <Label>Estado do supervisor</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {supervisorStates.map((state) => (
                        <button
                          key={state}
                          type="button"
                          className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                            form.supervisorState === state
                              ? "border-primary/40 bg-primary/8 text-primary"
                              : "border-border/70 bg-background/70 text-foreground hover:bg-muted/40"
                          }`}
                          onClick={() => updateField("supervisorState", state)}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {feedback ? (
                  <div
                    className={`rounded-2xl border p-4 text-sm ${
                      feedbackType === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {feedback}
                  </div>
                ) : null}

                <Button type="submit" className="h-11 rounded-xl text-base">
                  Cadastrar usuario
                </Button>
              </form>
            ) : (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                Somente administradores podem cadastrar ou excluir usuarios.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-lg">Usuarios cadastrados</CardTitle>
            </div>
            <CardDescription>
              Lista da API com perfil, escopo e controle de exclusao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {usersPagination.isLoading ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                Carregando usuarios...
              </div>
            ) : null}

            {!usersPagination.isLoading && users.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground shadow-sm">
                Nenhum usuario encontrado nesta pagina.
              </div>
            ) : null}

            {!usersPagination.isLoading
              ? users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : user.role === "supervisor"
                                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <Crown className="size-3.5" />
                            ) : user.role === "supervisor" ? (
                              <UserCog className="size-3.5" />
                            ) : (
                              <BadgeCheck className="size-3.5" />
                            )}
                            {getRoleLabel(user.role)}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {user.role === "representante" ? (
                              <Building2 className="size-3.5" />
                            ) : (
                              <MapPinned className="size-3.5" />
                            )}
                            {getUserScopeDescription(user)}
                          </span>
                        </div>
                      </div>

                      {isAdmin ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 cursor-pointer rounded-xl hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              : null}

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Pagina{" "}
                  <span className="font-semibold text-foreground">
                    {usersPagination.totalPages === 0
                      ? 0
                      : usersPagination.page + 1}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">
                    {usersPagination.totalPages}
                  </span>
                  <span className="block text-xs">
                    {usersPagination.size} usuarios por pagina
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={usersPagination.first || usersPagination.isLoading}
                    onClick={() => setUsersPage(usersPagination.page - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={usersPagination.last || usersPagination.isLoading}
                    onClick={() => setUsersPage(usersPagination.page + 1)}
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl"
              onClick={logout}
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
