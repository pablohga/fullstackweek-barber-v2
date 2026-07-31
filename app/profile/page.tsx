"use client"

import { useSession } from "next-auth/react"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { updateUserRole } from "../_actions/update-user-role"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { StoreIcon, UserIcon } from "lucide-react"
import Link from "next/link"

const ProfilePage = () => {
  const { data: session, update } = useSession()
  const router = useRouter()

  if (!session?.user) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">
          <p className="text-gray-400">
            Você precisa estar logado para acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  const currentRole = (session.user as any).role || "CLIENT"

  const handleRoleChange = async (role: "CLIENT" | "BARBERSHOP") => {
    try {
      await updateUserRole(role)
      await update({ role })
      toast.success("Tipo de conta atualizado com sucesso!")
      router.refresh()
      if (role === "BARBERSHOP") {
        router.push("/barbershop-dashboard")
      }
    } catch (error) {
      toast.error("Erro ao atualizar tipo de conta.")
    }
  }

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-xl space-y-6 p-5">
        <h1 className="text-xl font-bold">Meu Perfil</h1>

        <div className="space-y-4 rounded-xl border border-solid p-5">
          <div className="flex items-center gap-3">
            <img
              src={session.user.image || ""}
              alt={session.user.name || ""}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-lg font-bold">{session.user.name}</h2>
              <p className="text-sm text-gray-400">{session.user.email}</p>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-semibold uppercase text-gray-400">
              Tipo de Conta
            </p>
            <div className="flex gap-4">
              <Button
                variant={currentRole === "CLIENT" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => handleRoleChange("CLIENT")}
              >
                <UserIcon size={16} />
                Cliente
              </Button>
              <Button
                variant={currentRole === "BARBERSHOP" ? "default" : "outline"}
                className="flex-1 gap-2"
                onClick={() => handleRoleChange("BARBERSHOP")}
              >
                <StoreIcon size={16} />
                Barbearia (Dono)
              </Button>
            </div>
          </div>

          {currentRole === "BARBERSHOP" && (
            <div className="pt-2">
              <Button asChild className="w-full gap-2">
                <Link href="/barbershop-dashboard">
                  <StoreIcon size={18} />
                  Acessar Painel da Barbearia
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
