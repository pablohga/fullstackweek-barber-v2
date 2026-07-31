"use client"

import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { updateBookingStatus } from "@/app/_actions/update-booking-status"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface BookingsManagementProps {
  barbershop: any
}

const BookingsManagement = ({ barbershop }: BookingsManagementProps) => {
  const router = useRouter()

  const allBookings = barbershop.services.flatMap((service: any) =>
    service.bookings.map((booking: any) => ({
      ...booking,
      serviceName: service.name,
      servicePrice: service.price,
    })),
  )

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

  if (allBookings.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Nenhum agendamento para esta barbearia ainda.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {allBookings.map((booking: any) => {
        const isConfirmed = booking.status === "CONFIRMED" || !booking.status
        const isFinished = booking.status === "FINISHED"
        const isCancelled = booking.status === "CANCELLED"

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
                    isCancelled
                      ? "destructive"
                      : isFinished
                        ? "secondary"
                        : "default"
                  }
                >
                  {isCancelled
                    ? "Cancelado"
                    : isFinished
                      ? "Finalizado"
                      : "Confirmado"}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                Cliente:{" "}
                <span className="font-semibold text-foreground">
                  {booking.user?.name || "Cliente"}
                </span>{" "}
                ({booking.user?.email})
              </p>
              <p className="text-xs text-gray-400">
                Data:{" "}
                {format(new Date(booking.date), "dd 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isConfirmed && (
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
                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
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
      })}
    </div>
  )
}

export default BookingsManagement
