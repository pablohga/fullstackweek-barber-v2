"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog"
import { updateBarbershop } from "@/app/_actions/update-barbershop"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

interface BarbershopData {
  id: string
  name: string
  address: string
  phones: string[]
  description: string
  imageUrl: string
}

interface EditBarbershopModalProps {
  barbershop: BarbershopData
}

const EditBarbershopModal = ({ barbershop }: EditBarbershopModalProps) => {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [name, setName] = useState(barbershop.name)
  const [address, setAddress] = useState(barbershop.address)
  const [phone, setPhone] = useState(barbershop.phones?.[0] || "")
  const [description, setDescription] = useState(barbershop.description || "")
  const [imageUrl, setImageUrl] = useState(barbershop.imageUrl)
  const [loading, setLoading] = useState(false)
  const [successFeedback, setSuccessFeedback] = useState(false)
  const router = useRouter()

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !address || !imageUrl) {
      toast.error("Preencha os campos obrigatórios.")
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmUpdate = async () => {
    try {
      setLoading(true)
      await updateBarbershop({
        id: barbershop.id,
        name,
        address,
        phones: [phone || "(11) 99999-9999"],
        description: description || "",
        imageUrl,
      })
      setConfirmOpen(false)
      setSuccessFeedback(true)
      toast.success("Estabelecimento atualizado com sucesso!")

      setTimeout(() => {
        setSuccessFeedback(false)
        setOpen(false)
        router.refresh()
      }, 1500)
    } catch (error) {
      toast.error("Erro ao atualizar estabelecimento.")
      setConfirmOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Pencil className="h-4 w-4" />
        Editar Estabelecimento
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Estabelecimento</DialogTitle>
            <DialogDescription>
              Altere as informações e a imagem do seu estabelecimento
              cadastrado.
            </DialogDescription>
          </DialogHeader>

          {successFeedback ? (
            <div className="space-y-3 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
                ✓
              </div>
              <p className="text-lg font-bold text-green-600">
                Concluído com sucesso!
              </p>
              <p className="text-sm text-muted-foreground">
                As alterações foram salvas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveClick} className="space-y-4 py-2">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400">
                    Nome do Estabelecimento
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do estabelecimento"
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
                    placeholder="Endereço completo"
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
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400">
                    URL da Imagem (Foto)
                  </label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-16 w-16 rounded-md border object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80"
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        Pré-visualização da imagem
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400">
                    Descrição
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descrição do estabelecimento"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Alteração</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja salvar as novas informações e a imagem
              deste estabelecimento?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={loading}>
              {loading ? "Salvando..." : "Confirmar e Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditBarbershopModal
