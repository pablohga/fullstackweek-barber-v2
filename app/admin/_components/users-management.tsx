"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { updateUser } from "@/app/_actions/admin/update-user"
import { updatePassword } from "@/app/_actions/admin/update-password"
import { deleteUser } from "@/app/_actions/admin/delete-user"
import { updateBarbershopAccount } from "@/app/_actions/admin/update-barbershop-account"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"

interface UsersManagementProps {
  users: any[]
}

const UsersManagement = ({ users }: UsersManagementProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [clientDetailsUser, setClientDetailsUser] = useState<any>(null)
  const [editBarbershopUser, setEditBarbershopUser] = useState<any>(null)

  // Barbershop edit state
  const [barbershopName, setBarbershopName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [address, setAddress] = useState("")
  const [complement, setComplement] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [billingPeriod, setBillingPeriod] = useState("Mensal")
  const [billingAmount, setBillingAmount] = useState("39,00")
  const [isVerified, setIsVerified] = useState(false)
  const [featuredUntil, setFeaturedUntil] = useState("")

  // Generic edit user state
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")

  const [newPassword, setNewPassword] = useState("")
  const [passwordModalUser, setPasswordModalUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEditClick = (user: any) => {
    if (user.role === "BARBERSHOP") {
      openEditBarbershop(user)
    } else {
      setSelectedUser(user)
      setEditName(user.name || "")
      setEditEmail(user.email || "")
      setEditRole(user.role || "CLIENT")
    }
  }

  const openEditBarbershop = (user: any) => {
    setEditBarbershopUser(user)
    const bs = user.barbershops?.[0]
    setBarbershopName(bs?.name || "")
    setOwnerName(user.name || "")
    setPhone(user.phone || "")
    setWhatsapp(user.whatsapp || "")
    setEmail(user.email || "")
    setIsVerified(bs?.isVerified || false)
    setFeaturedUntil(
      bs?.featuredUntil
        ? new Date(bs.featuredUntil).toISOString().split("T")[0]
        : "",
    )

    // Try parsing address: "Rua X, Complemento, Cidade - Estado" or similar
    const fullAddr = user.address || bs?.address || ""
    setAddress(fullAddr)
    setComplement("")
    setCity("")
    setState("")

    // Parse description for billing plan if available
    if (bs?.description?.includes("Semestral")) {
      setBillingPeriod("Semestral")
      setBillingAmount("240,00")
    } else if (bs?.description?.includes("Anual")) {
      setBillingPeriod("Anual")
      setBillingAmount("468,00")
    } else {
      setBillingPeriod("Mensal")
      setBillingAmount("39,00")
    }
  }

  const handleBillingChange = (period: string, amount: string) => {
    setBillingPeriod(period)
    setBillingAmount(amount)
  }

  const handleSetFeaturedDays = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setFeaturedUntil(d.toISOString().split("T")[0])
  }

  const handleUpdateBarbershopSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editBarbershopUser) return

    try {
      setLoading(true)
      await updateBarbershopAccount({
        userId: editBarbershopUser.id,
        barbershopName,
        ownerName,
        address,
        complement,
        state,
        city,
        phone,
        whatsapp,
        email,
        billingPeriod,
        billingAmount,
        isVerified,
        featuredUntil: featuredUntil
          ? new Date(featuredUntil).toISOString()
          : null,
      })
      toast.success("Estabelecimento atualizado com sucesso!")
      setEditBarbershopUser(null)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar estabelecimento.")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      setLoading(true)
      await updateUser({
        userId: selectedUser.id,
        name: editName,
        email: editEmail,
        role: editRole,
      })
      toast.success("Usuário atualizado com sucesso!")
      setSelectedUser(null)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao atualizar usuário.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordModalUser || !newPassword) return

    try {
      setLoading(true)
      await updatePassword({
        userId: passwordModalUser.id,
        newPassword,
      })
      toast.success("Senha alterada com sucesso!")
      setPasswordModalUser(null)
      setNewPassword("")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao alterar senha.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta conta?")) return

    try {
      await deleteUser(userId)
      toast.success("Conta apagada com sucesso!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao apagar conta.")
    }
  }

  const handleEmitirCobranca = () => {
    toast.info("Função Emitir cobrança será implementada futuramente.")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        Gerenciamento de Contas (Clientes e Estabelecimentos)
      </h3>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/50">
                <td
                  className="cursor-pointer p-3 font-medium text-primary hover:underline"
                  onClick={() => {
                    if (user.role === "CLIENT") {
                      setClientDetailsUser(user)
                    } else if (user.role === "BARBERSHOP") {
                      openEditBarbershop(user)
                    }
                  }}
                >
                  {user.role === "BARBERSHOP" && user.barbershops?.[0]?.name
                    ? `${user.barbershops[0].name} (${user.name || "Responsável"})`
                    : user.name || "Sem Nome"}{" "}
                  {user.role === "CLIENT" && "(Ver Detalhes)"}
                  {user.role === "BARBERSHOP" && "(Editar Estabelecimento)"}
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <Badge
                    variant={
                      user.role === "ADMIN"
                        ? "destructive"
                        : user.role === "BARBERSHOP"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {user.role}
                  </Badge>
                </td>
                <td className="space-x-2 p-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPasswordModalUser(user)}
                  >
                    Senha
                  </Button>
                  {user.role !== "ADMIN" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.id)}
                    >
                      Apagar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Cliente */}
      <Dialog
        open={!!clientDetailsUser}
        onOpenChange={() => setClientDetailsUser(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {clientDetailsUser && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400">Nome:</p>
                <p className="text-base font-bold">{clientDetailsUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400">E-mail:</p>
                <p className="font-bold">{clientDetailsUser.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Criado em:</p>
                <p>
                  {new Date(clientDetailsUser.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Agendamentos Realizados (
                  {clientDetailsUser.bookings?.length || 0})
                </p>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded border p-2">
                  {clientDetailsUser.bookings?.length === 0 ? (
                    <p className="text-gray-400">Nenhum agendamento.</p>
                  ) : (
                    clientDetailsUser.bookings?.map((booking: any) => (
                      <div key={booking.id} className="border-b pb-1 text-xs">
                        <p className="font-bold">{booking.service?.name}</p>
                        <p className="text-gray-400">
                          Data: {new Date(booking.date).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  Avaliações Feitas ({clientDetailsUser.reviews?.length || 0})
                </p>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded border p-2">
                  {clientDetailsUser.reviews?.length === 0 ? (
                    <p className="text-gray-400">Nenhuma avaliação.</p>
                  ) : (
                    clientDetailsUser.reviews?.map((review: any) => (
                      <div key={review.id} className="border-b pb-1 text-xs">
                        <p className="font-bold">
                          Nota: {review.rating} estrelas
                        </p>
                        <p className="text-gray-300">
                          {review.comment || "Sem comentário"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Estabelecimento (Pre-preenchido) */}
      <Dialog
        open={!!editBarbershopUser}
        onOpenChange={() => setEditBarbershopUser(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conta de Estabelecimento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBarbershopSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Nome do Estabelecimento
                </label>
                <Input
                  value={barbershopName}
                  onChange={(e) => setBarbershopName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Nome do Responsável
                </label>
                <Input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-400">
                  Endereço
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Complemento
                </label>
                <Input
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Cidade
                </label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Estado
                </label>
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Telefone
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400">
                  Telefone (WhatsApp)
                </label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400">
                E-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Destaque e Verificação */}
            <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
              <h4 className="text-xs font-bold uppercase text-gray-400">
                Visibilidade no Marketplace
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <label
                  htmlFor="isVerified"
                  className="cursor-pointer text-sm font-medium"
                >
                  Selo de Estabelecimento Verificado (isVerified)
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-400">
                  Em Destaque Até (Featured Until)
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    type="date"
                    value={featuredUntil}
                    onChange={(e) => setFeaturedUntil(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetFeaturedDays(30)}
                    >
                      +30 dias
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetFeaturedDays(60)}
                    >
                      +60 dias
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFeaturedUntil("")}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-400">
                Período de Cobrança
              </label>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0">
                <label className="flex cursor-pointer items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={billingPeriod === "Mensal"}
                    onChange={() => handleBillingChange("Mensal", "39,00")}
                    className="rounded border-input"
                  />
                  <span>Mensal (R$ 39,00)</span>
                </label>
                <label className="flex cursor-pointer items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={billingPeriod === "Semestral"}
                    onChange={() => handleBillingChange("Semestral", "240,00")}
                    className="rounded border-input"
                  />
                  <span>Semestral (R$ 240,00)</span>
                </label>
                <label className="flex cursor-pointer items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={billingPeriod === "Anual"}
                    onChange={() => handleBillingChange("Anual", "468,00")}
                    className="rounded border-input"
                  />
                  <span>Anual (R$ 468,00)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleEmitirCobranca}
              >
                Emitir cobrança
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Usuário (Geral / Cliente / Admin) */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Nome
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                E-mail
              </label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Tipo (Role)
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CLIENT">CLIENT</option>
                <option value="BARBERSHOP">BARBERSHOP</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Alterar Senha */}
      <Dialog
        open={!!passwordModalUser}
        onOpenChange={() => setPasswordModalUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Alterar Senha para {passwordModalUser?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Nova Senha
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersManagement
