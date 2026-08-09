"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { updateProfessional } from "@/app/_actions/update-professional"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { WorkingHoursModal } from "./working-hours-modal"
import { ScheduleBlocksModal } from "./schedule-blocks-modal"

interface ProfessionalsManagementProps {
  professionals: any[]
}

const ProfessionalsManagement = ({
  professionals,
}: ProfessionalsManagementProps) => {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggleActive = async (
    professionalId: string,
    currentActive: boolean,
  ) => {
    try {
      setLoadingId(professionalId)
      await updateProfessional({
        professionalId,
        active: !currentActive,
      })
      toast.success(
        !currentActive
          ? "Profissional ativado com sucesso!"
          : "Profissional inativado com sucesso!",
      )
      router.refresh()
    } catch (error) {
      toast.error("Erro ao atualizar status do profissional.")
    } finally {
      setLoadingId(null)
    }
  }

  if (professionals.length === 0) {
    return (
      <p className="text-xs text-gray-400">Nenhum profissional cadastrado.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {professionals.map((prof: any) => (
        <div
          key={prof.id}
          className="flex flex-col gap-3 rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={
                    prof.imageUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                  }
                  alt={prof.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold">{prof.name}</p>
                <Badge variant={prof.active ? "default" : "secondary"}>
                  {prof.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={loadingId === prof.id}
              onClick={() => handleToggleActive(prof.id, prof.active)}
            >
              {prof.active ? "Inativar" : "Ativar"}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            <WorkingHoursModal professional={prof} />
            <ScheduleBlocksModal professional={prof} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProfessionalsManagement
