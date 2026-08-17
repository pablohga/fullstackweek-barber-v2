"use client"

import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { updateBookingStatus } from "@/app/_actions/update-booking-status"
import { resendBookingNotification } from "@/app/_actions/resend-booking-notification"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/app/_components/ui/dialog"
import { Input } from "@/app/_components/ui/input"
import { useState } from "react"
import {
  CheckCircle2Icon,
  SearchIcon,
  MailIcon,
  BellRingIcon,
} from "lucide-react"

interface BookingsManagementProps {
  barbershop: any
}

const BookingsManagement = ({ barbershop }: BookingsManagementProps) => {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [selectedBookingForNotification, setSelectedBookingForNotification] =
    useState<any | null>(null)
  const [clientFilter, setClientFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [professionalFilter, setProfessionalFilter] = useState("")

  const allBookings = barbershop.services.flatMap((service: any) =>
    service.bookings.map((booking: any) => ({
      ...booking,
      serviceName: service.name,
      servicePrice: service.price,
      professionalName: booking.professional?.name || "Não atribuído",
      professionalId: booking.professionalId,
    })),
  )

  const filteredAllBookings = allBookings.filter((booking: any) => {
    const matchesProfessional = professionalFilter
      ? booking.professionalId === professionalFilter
      : true
    return matchesProfessional
  })

  const concludedBookings = filteredAllBookings.filter(
    (booking: any) => booking.status === "FINISHED",
  )

  const filteredConcludedBookings = concludedBookings.filter((booking: any) => {
    const clientName = booking.user?.name || "Cliente"
    const matchesName = clientName
      .toLowerCase()
      .includes(clientFilter.toLowerCase())
    const matchesDate = dateFilter
      ? format(new Date(booking.date), "yyyy-MM-dd") === dateFilter
      : true
    return matchesName && matchesDate
  })

  const handleStatusUpdate = async (
    bookingId: string,
    status: "CONFIRMED" | "CANCELLED" | "FINISHED",
  ) => {
    try {
      await updateBookingStatus({ bookingId, status })
      toast.success("Status do agendamento atualizado!")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao atualizar agendamento.")
    }
  }

  const handleResendNotification = async () => {
    if (!selectedBookingForNotification) return
    try {
      await resendBookingNotification({
        bookingId: selectedBookingForNotification.id,
      })
      toast.success("Notificação enviada por e-mail e WhatsApp com sucesso!")
      setIsNotificationModalOpen(false)
      setSelectedBookingForNotification(null)
      router.refresh()
    } catch (error) {
      toast.error("Erro ao enviar notificação.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="text-sm font-semibold uppercase text-gray-400">
            Gerenciar Agendamentos
          </h4>
          {barbershop.professionals?.length > 0 && (
            <select
              value={professionalFilter}
              onChange={(e) => setProfessionalFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              <option value="">Todos os Profissionais</option>
              {barbershop.professionals.map((prof: any) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CheckCircle2Icon size={16} />
              Agendamentos concluídos
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Agendamentos Concluídos ({concludedBookings.length})
              </DialogTitle>
            </DialogHeader>

            {/* Filtros */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="relative">
                <SearchIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Filtrar por nome do cliente..."
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Listagem */}
            <div className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto pr-1 pt-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar]:w-2">
              {filteredConcludedBookings.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  Nenhum agendamento concluído encontrado com os filtros
                  aplicados.
                </p>
              ) : (
                filteredConcludedBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold">
                          {booking.serviceName}
                        </p>
                        <Badge variant="secondary">Finalizado</Badge>
                      </div>
                      <p className="text-xs text-gray-300">
                        Profissional:{" "}
                        <span className="font-semibold text-primary">
                          {booking.professionalName}
                        </span>
                      </p>
                      <p className="text-sm text-gray-300">
                        Cliente:{" "}
                        <span className="font-semibold text-foreground">
                          {booking.user?.name || "Cliente"}
                        </span>
                        {booking.user?.email && ` (${booking.user.email})`}
                      </p>
                      <p className="text-xs text-gray-400">
                        Data e Hora:{" "}
                        {format(
                          new Date(booking.date),
                          "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          },
                        )}
                      </p>
                    </div>

                    <div className="text-right sm:self-center">
                      <p className="text-sm font-bold text-primary">
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(booking.servicePrice))}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end border-t pt-3">
              <DialogClose asChild>
                <Button variant="outline" size="sm">
                  Fechar
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filteredAllBookings.length === 0 ? (
        <p className="text-sm text-gray-400">
          Nenhum agendamento para este estabelecimento ainda.
        </p>
      ) : (
        filteredAllBookings.map((booking: any) => {
          const bookingDate = new Date(booking.date)
          const isConfirmed =
            (booking.status === "CONFIRMED" || !booking.status) &&
            isFuture(bookingDate)
          const isFinished = booking.status === "FINISHED"
          const isCancelled = booking.status === "CANCELLED"
          const isExpired =
            (booking.status === "CONFIRMED" || !booking.status) &&
            !isFuture(bookingDate)

          return (
            <div
              key={booking.id}
              className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 md:flex-row md:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{booking.serviceName}</p>
                  <Badge
                    variant={
                      isCancelled || isExpired
                        ? "destructive"
                        : isFinished
                          ? "secondary"
                          : "default"
                    }
                  >
                    {isCancelled
                      ? "Cancelado"
                      : isExpired
                        ? "Expirado"
                        : isFinished
                          ? "Finalizado"
                          : "Confirmado"}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-primary">
                  Profissional: {booking.professionalName}
                </p>
                <p className="text-sm text-gray-400">
                  Cliente:{" "}
                  <span className="font-semibold text-foreground">
                    {booking.user?.name || "Cliente"}
                  </span>{" "}
                  ({booking.user?.email})
                </p>
                <p className="text-xs text-gray-400">
                  Data:{" "}
                  {format(bookingDate, "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400">
                  {booking.confirmationSentAt && (
                    <span
                      className="flex items-center gap-1 text-green-500"
                      title="Confirmação enviada por e-mail/WhatsApp"
                    >
                      <MailIcon size={12} /> Confirmação enviada
                    </span>
                  )}
                  {booking.reminderSentAt && (
                    <span
                      className="flex items-center gap-1 text-yellow-500"
                      title="Lembrete enviado"
                    >
                      <BellRingIcon size={12} /> Lembrete enviado
                    </span>
                  )}
                  {booking.cancellationSentAt && (
                    <span
                      className="flex items-center gap-1 text-red-400"
                      title="Aviso de cancelamento enviado"
                    >
                      <MailIcon size={12} /> Cancelamento notificado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setSelectedBookingForNotification(booking)
                    setIsNotificationModalOpen(true)
                  }}
                >
                  <BellRingIcon size={14} />
                  Enviar notificação
                </Button>
                {(isConfirmed || isExpired) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => handleStatusUpdate(booking.id, "FINISHED")}
                    >
                      Concluir
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleStatusUpdate(booking.id, "CANCELLED")
                      }
                    >
                      Cancelar
                    </Button>
                  </>
                )}
                {isCancelled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                  >
                    Reativar
                  </Button>
                )}
              </div>
            </div>
          )
        })
      )}

      <Dialog
        open={isNotificationModalOpen}
        onOpenChange={setIsNotificationModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Enviar Notificação
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-300">
            Uma mensagem de notificação foi enviada ao cliente no momento que
            ele realizou o agendamento. Deseja enviar novamente a notificação?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Não
              </Button>
            </DialogClose>
            <Button size="sm" onClick={handleResendNotification}>
              Sim, enviar.
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BookingsManagement
