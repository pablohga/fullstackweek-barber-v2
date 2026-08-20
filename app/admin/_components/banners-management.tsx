"use client"

import { useState } from "react"
import { upsertBanner, resetBanner } from "@/app/_actions/admin/manage-banners"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ImageIcon, Trash2Icon, SaveIcon } from "lucide-react"

interface BannersManagementProps {
  banners: any[]
}

export const BannersManagement = ({ banners }: BannersManagementProps) => {
  const router = useRouter()
  const [loadingOrder, setLoadingOrder] = useState<number | null>(null)

  const [formData, setFormData] = useState<
    Record<number, { imageUrl: string; title: string }>
  >(() => {
    const initial: Record<number, { imageUrl: string; title: string }> = {}
    banners.forEach((b) => {
      initial[b.order] = {
        imageUrl: b.imageUrl || "",
        title: b.title || "",
      }
    })
    return initial
  })

  const handleChange = (
    order: number,
    field: "imageUrl" | "title",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [order]: {
        ...(prev[order] || { imageUrl: "", title: "" }),
        [field]: value,
      },
    }))
  }

  const handleSave = async (order: number) => {
    const data = formData[order]
    if (!data || !data.imageUrl) {
      toast.error("Informe a URL da imagem do banner.")
      return
    }

    try {
      setLoadingOrder(order)
      await upsertBanner({
        order,
        imageUrl: data.imageUrl,
        title: data.title,
      })
      toast.success(`Banner ${order + 1} atualizado com sucesso!`)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao salvar banner.")
    } finally {
      setLoadingOrder(null)
    }
  }

  const handleReset = async (order: number) => {
    if (
      !confirm(
        `Deseja remover a customização do Banner ${order + 1} e retornar ao padrão?`,
      )
    )
      return

    try {
      setLoadingOrder(order)
      await resetBanner(order)
      toast.success(`Banner ${order + 1} restaurado para o padrão!`)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao restaurar banner.")
    } finally {
      setLoadingOrder(null)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">
          Gerenciamento de Banners da Home (/)
        </h3>
      </div>
      <p className="text-xs text-gray-400">
        Personalize os 3 banners do carrossel da página inicial (/). Se remover
        a customização, o sistema usará a imagem padrão.
      </p>

      <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3">
        {[0, 1, 2].map((order) => {
          const banner = banners.find((b) => b.order === order)
          const currentForm = formData[order] || {
            imageUrl: banner?.imageUrl || "",
            title: banner?.title || "",
          }

          return (
            <div
              key={order}
              className="flex flex-col justify-between space-y-4 rounded-xl border bg-muted/20 p-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Banner #{order + 1}</span>
                  {banner?.isCustom ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      Customizado
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-gray-400">
                      Padrão
                    </span>
                  )}
                </div>

                {/* Preview */}
                <div className="relative h-32 w-full overflow-hidden rounded-lg border bg-background">
                  {currentForm.imageUrl ? (
                    <Image
                      src={currentForm.imageUrl}
                      alt={`Banner ${order + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400">
                      Título / Legenda
                    </label>
                    <Input
                      value={currentForm.title}
                      onChange={(e) =>
                        handleChange(order, "title", e.target.value)
                      }
                      placeholder="Título do banner..."
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400">
                      URL da Imagem
                    </label>
                    <Input
                      value={currentForm.imageUrl}
                      onChange={(e) =>
                        handleChange(order, "imageUrl", e.target.value)
                      }
                      placeholder="https://exemplo.com/imagem.png"
                      className="text-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-2">
                {banner?.isCustom && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-500 hover:text-red-600"
                    onClick={() => handleReset(order)}
                    disabled={loadingOrder === order}
                  >
                    <Trash2Icon size={14} /> Restaurar
                  </Button>
                )}
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSave(order)}
                  disabled={loadingOrder === order}
                >
                  <SaveIcon size={14} /> Salvar
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
