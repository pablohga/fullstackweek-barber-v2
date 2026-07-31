"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createService } from "@/app/_actions/create-service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ServiceFormProps {
  barbershopId: string
}

const ServiceForm = ({ barbershopId }: ServiceFormProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !imageUrl) {
      toast.error("Preencha os campos obrigatórios (Nome, Preço, Imagem).")
      return
    }

    try {
      setLoading(true)
      await createService({
        barbershopId,
        name,
        description: description || "Serviço profissional.",
        price: Number(price),
        imageUrl,
      })
      toast.success("Serviço cadastrado e precificado com sucesso!")
      setName("")
      setDescription("")
      setPrice("")
      setImageUrl("")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao cadastrar serviço.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Nome do Serviço
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Corte Degradê"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Preço (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex: 50.00"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            URL da Imagem
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemplo.com/servico.png"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Descrição
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do serviço..."
          />
        </div>
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Cadastrando..." : "Adicionar Serviço"}
      </Button>
    </form>
  )
}

export default ServiceForm
