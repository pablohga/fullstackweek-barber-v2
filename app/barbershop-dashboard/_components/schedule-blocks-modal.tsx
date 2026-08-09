"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"
import { getScheduleBlocks } from "@/app/_actions/get-schedule-blocks"
import { createScheduleBlock } from "@/app/_actions/create-schedule-block"
import { deleteScheduleBlock } from "@/app/_actions/delete-schedule-block"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CalendarOffIcon, TrashIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ScheduleBlocksModalProps {
  professional: any
}

export const ScheduleBlocksModal = ({
  professional,
}: ScheduleBlocksModalProps) => {
  const [open, setOpen] = useState(false)
  const [blocks, setBlocks] = useState<any[]>([])
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getScheduleBlocks(professional.id).then((res) => setBlocks(res || []))
    }
  }, [open, professional.id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) {
      toast.error("Selecione a data do bloqueio.")
      return
    }

    try {
      setLoading(true)
      await createScheduleBlock({
        professionalId: professional.id,
        date: new Date(date + "T00:00:00"),
        startTime: startTime || null,
        endTime: endTime || null,
        reason: reason || null,
      })
      toast.success("Bloqueio de agenda criado com sucesso!")
      setDate("")
      setStartTime("")
      setEndTime("")
      setReason("")
      const updated = await getScheduleBlocks(professional.id)
      setBlocks(updated || [])
      router.refresh()
    } catch (error) {
      toast.error("Erro ao criar bloqueio.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (blockId: string) => {
    try {
      await deleteScheduleBlock(blockId)
      toast.success("Bloqueio removido com sucesso!")
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      router.refresh()
    } catch (error) {
      toast.error("Erro ao remover bloqueio.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <CalendarOffIcon size={14} />
          Bloqueios
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bloqueios de Agenda - {professional.name}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border p-4"
        >
          <h4 className="text-xs font-bold uppercase text-gray-400">
            Adicionar Novo Bloqueio / Folga
          </h4>
          <div>
            <label className="text-xs font-semibold text-gray-400">Data</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Início (Opcional)
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Fim (Opcional)
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400">
              Motivo (Opcional)
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Folga, Feriado, Consulta médica"
            />
          </div>
          <Button type="submit" disabled={loading} size="sm">
            {loading ? "Adicionando..." : "Adicionar Bloqueio"}
          </Button>
        </form>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase text-gray-400">
            Bloqueios Cadastrados ({blocks.length})
          </h4>
          {blocks.length === 0 ? (
            <p className="text-xs text-gray-400">Nenhum bloqueio cadastrado.</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {blocks.map((block: any) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-xs"
                >
                  <div>
                    <p className="font-bold">
                      {format(new Date(block.date), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {block.startTime && block.endTime
                        ? `${block.startTime} às ${block.endTime}`
                        : "Dia Inteiro"}
                      {block.reason && ` — ${block.reason}`}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(block.id)}
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
