"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createBarbershop } from "@/app/_actions/create-barbershop"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const BarbershopForm = () => {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !address || !imageUrl) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }

    try {
      setLoading(true)
      await createBarbershop({
        name,
        address,
        phones: [phone || "(11) 99999-9999"],
        description: description || "Estabelecimento de alta qualidade.",
        imageUrl,
      })
      toast.success("Estabelecimento cadastrado com sucesso!")
      setName("")
      setAddress("")
      setPhone("")
      setDescription("")
      setImageUrl("")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao cadastrar estabelecimento.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Nome do Estabelecimento
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Estabelecimento Estilo"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Endereço
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: Rua Principal, 123"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Telefone / WhatsApp
          </label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: (11) 98888-8888"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">
            URL da Imagem (Foto)
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.png"
            required
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-400">Descrição</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição sobre o estabelecimento..."
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar Estabelecimento"}
      </Button>
    </form>
  )
}

export default BarbershopForm
