"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { updateUser } from "@/app/_actions/admin/update-user"
import { updatePassword } from "@/app/_actions/admin/update-password"
import { deleteUser } from "@/app/_actions/admin/delete-user"
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
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editRole, setEditRole] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordModalUser, setPasswordModalUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setEditName(user.name || "")
    setEditEmail(user.email || "")
    setEditRole(user.role || "CLIENT")
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        Gerenciamento de Contas (Clientes e Barbearias)
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
                    }
                  }}
                >
                  {user.name || "Sem Nome"}{" "}
                  {user.role === "CLIENT" && "(Ver Detalhes)"}
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

      {/* Modal de Editar Usuário */}
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
