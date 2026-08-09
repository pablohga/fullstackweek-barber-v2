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
import { getWorkingHours } from "@/app/_actions/get-working-hours"
import { setWorkingHours } from "@/app/_actions/set-working-hours"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ClockIcon } from "lucide-react"

const WEEKDAYS = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Segunda-feira" },
  { id: 2, label: "Terça-feira" },
  { id: 3, label: "Quarta-feira" },
  { id: 4, label: "Quinta-feira" },
  { id: 5, label: "Sexta-feira" },
  { id: 6, label: "Sábado" },
]

interface WorkingHoursModalProps {
  professional: any
}

export const WorkingHoursModal = ({ professional }: WorkingHoursModalProps) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hours, setHours] = useState<any[]>(
    WEEKDAYS.map((w) => ({
      weekday: w.id,
      isOpen: w.id !== 0,
      startTime: "08:00",
      endTime: "18:00",
      breakStart: "",
      breakEnd: "",
    })),
  )
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getWorkingHours(professional.id).then((res) => {
        if (res && res.length > 0) {
          setHours(
            WEEKDAYS.map((w) => {
              const found = res.find((r: any) => r.weekday === w.id)
              return found
                ? {
                    weekday: found.weekday,
                    isOpen: found.isOpen,
                    startTime: found.startTime,
                    endTime: found.endTime,
                    breakStart: found.breakStart || "",
                    breakEnd: found.breakEnd || "",
                  }
                : {
                    weekday: w.id,
                    isOpen: w.id !== 0,
                    startTime: "08:00",
                    endTime: "18:00",
                    breakStart: "",
                    breakEnd: "",
                  }
            }),
          )
        }
      })
    }
  }, [open, professional.id])

  const handleChange = (weekday: number, field: string, value: any) => {
    setHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, [field]: value } : h)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await setWorkingHours({
        professionalId: professional.id,
        workingHours: hours.map((h) => ({
          ...h,
          breakStart: h.breakStart || null,
          breakEnd: h.breakEnd || null,
        })),
      })
      toast.success("Horários de funcionamento atualizados com sucesso!")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao atualizar horários.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <ClockIcon size={14} />
          Horários
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Horário de Funcionamento - {professional.name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {WEEKDAYS.map((day) => {
              const h = hours.find((item) => item.weekday === day.id) || {
                isOpen: true,
                startTime: "08:00",
                endTime: "18:00",
                breakStart: "",
                breakEnd: "",
              }

              return (
                <div
                  key={day.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={h.isOpen}
                      onChange={(e) =>
                        handleChange(day.id, "isOpen", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="w-28 font-semibold">{day.label}</span>
                  </div>

                  {h.isOpen ? (
                    <div
                      id="working-hours-selection"
                      className="flex flex-wrap items-center gap-2"
                    >
                      <div>
                        <span className="text-xs text-gray-400">
                          Expediente:
                        </span>
                      </div>
                      <Input
                        type="time"
                        value={h.startTime}
                        onChange={(e) =>
                          handleChange(day.id, "startTime", e.target.value)
                        }
                        className="w-24 text-xs"
                      />
                      <span>às</span>
                      <Input
                        type="time"
                        value={h.endTime}
                        onChange={(e) =>
                          handleChange(day.id, "endTime", e.target.value)
                        }
                        className="w-24 text-xs"
                      />
                      <div>
                        <span className="text-xs text-gray-400">Almoço:</span>
                      </div>

                      <Input
                        type="time"
                        value={h.breakStart}
                        onChange={(e) =>
                          handleChange(day.id, "breakStart", e.target.value)
                        }
                        className="w-24 text-xs"
                        placeholder="Início"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={h.breakEnd}
                        onChange={(e) =>
                          handleChange(day.id, "breakEnd", e.target.value)
                        }
                        className="w-24 text-xs"
                        placeholder="Fim"
                      />
                    </div>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">
                      Fechado
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Horários"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
