"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Card } from "@/app/_components/ui/card"
import { PlusIcon, Trash2Icon, XIcon, ImageIcon } from "lucide-react"
import { addGalleryImage } from "@/app/_actions/add-gallery-image"
import { deleteGalleryImage } from "@/app/_actions/delete-gallery-image"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ClientGalleryProps {
  images: Array<{ id: string; imageUrl: string }>
}

export default function ClientGallery({ images }: ClientGalleryProps) {
  const [imageUrlInput, setImageUrlInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return

    if (images.length >= 6) {
      toast.error(
        "Limite de 6 imagens atingido! Você deve apagar uma imagem da galeria antes de adicionar uma nova.",
      )
      return
    }

    try {
      setLoading(true)
      await addGalleryImage(imageUrlInput.trim())
      setImageUrlInput("")
      toast.success("Imagem adicionada à galeria com sucesso!")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar imagem.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      await deleteGalleryImage(imageId)
      toast.success("Imagem removida da galeria.")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao apagar imagem.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Galeria de Cortes e Modelos Favoritos ({images.length}/6)
          </h2>
        </div>
      </div>

      {/* Adicionar Imagem Form */}
      <form onSubmit={handleAddImage} className="flex gap-2">
        <Input
          placeholder="Cole a URL da imagem de corte / modelo..."
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          disabled={images.length >= 6 || loading}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={images.length >= 6 || loading || !imageUrlInput.trim()}
          className="gap-2 font-semibold"
        >
          <PlusIcon size={16} />
          Adicionar
        </Button>
      </form>

      {images.length >= 6 && (
        <p className="text-xs font-medium text-destructive">
          ⚠️ Limite de 6 imagens atingido. Você deve apagar uma imagem da
          galeria se desejar adicionar outra.
        </p>
      )}

      {/* Galeria Grid */}
      {images.length === 0 ? (
        <Card className="border-dashed bg-card/20 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-sm font-bold">Nenhuma imagem na galeria</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Adicione referências de cortes de cabelo e modelos favoritos para
            mostrar ao seu barbeiro.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <img
                src={img.imageUrl}
                alt="Modelo / Corte Favorito"
                className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                onClick={() => setSelectedImage(img.imageUrl)}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 gap-1 px-2.5 text-xs font-semibold"
                  onClick={() => handleDelete(img.id)}
                >
                  <Trash2Icon size={14} />
                  Apagar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Lightbox Expandido */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full shadow-lg"
              onClick={() => setSelectedImage(null)}
            >
              <XIcon size={20} />
            </Button>
            <img
              src={selectedImage}
              alt="Visualização Expandida"
              className="max-h-[85vh] max-w-full rounded-2xl border border-white/10 object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
