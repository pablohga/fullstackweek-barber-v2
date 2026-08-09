"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createProfessional } from "@/app/_actions/create-professional"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfessionalFormProps {
  barbershopId: string
}

const ProfessionalForm = ({ barbershopId }: ProfessionalFormProps) => {
  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) {
      toast.error("Preencha o nome do profissional.")
      return
    }

    try {
      setLoading(true)
      await createProfessional({
        barbershopId,
        name,
        imageUrl: imageUrl || undefined,
      })
      toast.success("Profissional cadastrado com sucesso!")
      setName("")
      setImageUrl("")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao cadastrar profissional.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Nome do Profissional
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Carlos Barbeiro"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            URL da Foto (Opcional)
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.png"
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Cadastrando..." : "Adicionar Profissional"}
      </Button>
    </form>
  )
}

export default ProfessionalForm
