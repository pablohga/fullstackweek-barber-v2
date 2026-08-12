"use client"

import { Barbershop, BarbershopService, Booking } from "@prisma/client"
import Image from "next/image"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"
import { Calendar } from "./ui/calendar"
import { ptBR } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import { createBooking } from "../_actions/create-booking"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { getBookings } from "../_actions/get-bookings"
import { getWorkingHours } from "../_actions/get-working-hours"
import { getScheduleBlocks } from "../_actions/get-schedule-blocks"
import { getAvailableTimes } from "../_helpers/get-available-times"
import { Dialog, DialogContent } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import BookingSummary from "./booking-summary"
import { useRouter } from "next/navigation"

interface ServiceItemProps {
  service: BarbershopService
  barbershop: Pick<Barbershop, "name"> & { professionals?: any[] }
}

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data } = useSession()
  const router = useRouter()
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | undefined
  >(undefined)
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  )
  const [workingHours, setWorkingHours] = useState<any[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<any[]>([])
  const [dayBookings, setDayBookings] = useState<Booking[]>([])
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false)

  useEffect(() => {
    const fetchProfData = async () => {
      if (!selectedProfessionalId) return
      const [wh, blocks] = await Promise.all([
        getWorkingHours(selectedProfessionalId),
        getScheduleBlocks(selectedProfessionalId),
      ])
      setWorkingHours(wh || [])
      setScheduleBlocks(blocks || [])
    }
    fetchProfData()
  }, [selectedProfessionalId])

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedDay || !selectedProfessionalId) return
      const bookings = await getBookings({
        date: selectedDay,
        professionalId: selectedProfessionalId,
      })
      setDayBookings(bookings)
    }
    fetchBookings()
  }, [selectedDay, selectedProfessionalId])

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return
    return setTimeOnDate(selectedDay, selectedTime)
  }, [selectedDay, selectedTime])

  function setTimeOnDate(date: Date, time: string) {
    const [hours, minutes] = time.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, 0, 0)
    return newDate
  }

  const handleBookingClick = () => {
    if (data?.user) {
      return setBookingSheetIsOpen(true)
    }
    return setSignInDialogIsOpen(true)
  }

  const handleBookingSheetOpenChange = () => {
    setSelectedProfessionalId(undefined)
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setWorkingHours([])
    setScheduleBlocks([])
    setDayBookings([])
    setBookingSheetIsOpen(false)
  }

  const handleProfessionalSelect = (profId: string) => {
    setSelectedProfessionalId(profId)
    setSelectedDay(undefined)
    setSelectedTime(undefined)
    setDayBookings([])
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date)
    setSelectedTime(undefined)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleCreateBooking = async () => {
    try {
      if (!selectedDate || !selectedProfessionalId) return
      await createBooking({
        serviceId: service.id,
        professionalId: selectedProfessionalId,
        date: selectedDate,
      })
      handleBookingSheetOpenChange()
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      })
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Erro ao criar reserva!")
    }
  }

  const timeList = useMemo(() => {
    if (!selectedDay || !selectedProfessionalId) return []
    return getAvailableTimes({
      selectedDay,
      workingHours,
      scheduleBlocks,
      bookings: dayBookings,
    })
  }, [
    workingHours,
    scheduleBlocks,
    dayBookings,
    selectedDay,
    selectedProfessionalId,
  ])

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          {/* IMAGE */}
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              alt={service.name}
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          {/* DIREITA */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            {/* PREÇO E BOTÃO */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="overflow-y-auto px-0">
                  <SheetHeader>
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  {/* SELECIONAR PROFISSIONAL */}
                  <div className="space-y-3 border-b border-solid p-5">
                    <h2 className="text-xs font-bold uppercase text-gray-400">
                      Selecione o Profissional
                    </h2>
                    {barbershop.professionals &&
                    barbershop.professionals.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {barbershop.professionals.map((prof: any) => (
                          <div
                            key={prof.id}
                            onClick={() => handleProfessionalSelect(prof.id)}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                              selectedProfessionalId === prof.id
                                ? "border-primary bg-primary/10"
                                : "hover:border-gray-400"
                            }`}
                          >
                            <div className="relative h-10 w-10 overflow-hidden rounded-full">
                              <Image
                                src={
                                  prof.imageUrl ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                                }
                                alt={prof.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{prof.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-red-500">
                        Nenhum profissional disponível para esta barbearia no
                        momento.
                      </p>
                    )}
                  </div>

                  {selectedProfessionalId && (
                    <div className="border-b border-solid py-5">
                      <Calendar
                        mode="single"
                        locale={ptBR}
                        selected={selectedDay}
                        onSelect={handleDateSelect}
                        fromDate={new Date()}
                        styles={{
                          head_cell: {
                            width: "100%",
                            textTransform: "capitalize",
                          },
                          cell: {
                            width: "100%",
                          },
                          button: {
                            width: "100%",
                          },
                          nav_button_previous: {
                            width: "32px",
                            height: "32px",
                          },
                          nav_button_next: {
                            width: "32px",
                            height: "32px",
                          },
                          caption: {
                            textTransform: "capitalize",
                          },
                        }}
                      />
                    </div>
                  )}

                  {selectedDay && selectedProfessionalId && (
                    <div className="border-b border-solid p-5">
                      <p className="mb-3 text-xs font-bold uppercase text-gray-400">
                        Selecione o Horário
                      </p>
                      {timeList.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                          {timeList.map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              className="rounded-full text-xs"
                              onClick={() => handleTimeSelect(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Não há horários disponíveis para este profissional
                          neste dia (fechado ou sem horários livres).
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        barbershop={barbershop}
                        service={service}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}
                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={
                        !selectedProfessionalId || !selectedDay || !selectedTime
                      }
                    >
                      Confirmar
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={signInDialogIsOpen}
        onOpenChange={(open) => setSignInDialogIsOpen(open)}
      >
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ServiceItem
