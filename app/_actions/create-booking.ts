"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { format, startOfDay, endOfDay } from "date-fns"
import { notifyBookingConfirmation } from "../_lib/notifications"

interface CreateBookingParams {
  serviceId: string
  professionalId: string
  date: Date
}

export const createBooking = async (params: CreateBookingParams) => {
  const user = await getServerSession(authOptions)
  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  if (!params.professionalId) {
    throw new Error("Profissional não selecionado")
  }

  const bookingDate = new Date(params.date)
  const weekday = bookingDate.getDay()
  const timeStr = format(bookingDate, "HH:mm")

  // 1. Check working hours
  const workingHours = await db.workingHours.findUnique({
    where: {
      professionalId_weekday: {
        professionalId: params.professionalId,
        weekday,
      },
    },
  })

  if (!workingHours || !workingHours.isOpen) {
    throw new Error("Profissional não atiende neste dia.")
  }

  if (timeStr < workingHours.startTime || timeStr >= workingHours.endTime) {
    throw new Error("Horário fora do expediente do profissional.")
  }

  if (
    workingHours.breakStart &&
    workingHours.breakEnd &&
    timeStr >= workingHours.breakStart &&
    timeStr < workingHours.breakEnd
  ) {
    throw new Error("Horário coincide com o intervalo do profissional.")
  }

  // 2. Check schedule blocks
  const blocks = await db.scheduleBlock.findMany({
    where: {
      professionalId: params.professionalId,
      date: {
        gte: startOfDay(bookingDate),
        lte: endOfDay(bookingDate),
      },
    },
  })

  for (const block of blocks) {
    if (!block.startTime || !block.endTime) {
      throw new Error("Profissional indisponível nesta data (bloqueio total).")
    }
    if (timeStr >= block.startTime && timeStr < block.endTime) {
      throw new Error("Horário bloqueado na agenda do profissional.")
    }
  }

  // 3. Check existing confirmed bookings
  const existingBooking = await db.booking.findFirst({
    where: {
      professionalId: params.professionalId,
      date: bookingDate,
      status: "CONFIRMED",
    },
  })

  if (existingBooking) {
    throw new Error("Este horário já está ocupado para este profissional.")
  }

  const userId = (user.user as any).id

  const [dbUser, serviceWithBarbershop, professional] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.barbershopService.findUnique({
      where: { id: params.serviceId },
      include: { barbershop: true },
    }),
    params.professionalId
      ? db.professional.findUnique({ where: { id: params.professionalId } })
      : Promise.resolve(null),
  ])

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      professionalId: params.professionalId,
      date: bookingDate,
      userId,
      confirmationSentAt: new Date(),
    },
  })

  if (dbUser && serviceWithBarbershop) {
    notifyBookingConfirmation({
      clientName: dbUser.name || "Cliente",
      clientEmail: dbUser.email,
      clientPhone: dbUser.phone,
      clientWhatsapp: dbUser.whatsapp,
      barbershopName: serviceWithBarbershop.barbershop.name,
      serviceName: serviceWithBarbershop.name,
      professionalName: professional?.name,
      date: bookingDate,
    }).catch((err) =>
      console.error("[Booking Confirmation Notification Error]", err),
    )
  }

  revalidatePath("/barbershops/[id]")
  revalidatePath("/bookings")
  revalidatePath("/barbershop-dashboard")
}
