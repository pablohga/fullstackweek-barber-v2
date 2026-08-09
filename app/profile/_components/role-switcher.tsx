"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/app/_components/ui/button"
import { updateUserRole } from "@/app/_actions/update-user-role"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { StoreIcon, UserIcon } from "lucide-react"

interface RoleSwitcherProps {
  currentRole: string
}

export default function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const { update } = useSession()
  const router = useRouter()

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
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
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
  )
}
