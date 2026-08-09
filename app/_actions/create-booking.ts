"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"

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

  const existingBooking = await db.booking.findFirst({
    where: {
      professionalId: params.professionalId,
      date: params.date,
      status: "CONFIRMED",
    },
  })

  if (existingBooking) {
    throw new Error("Este horário já está ocupado para este profissional.")
  }

  await db.booking.create({
    data: {
      serviceId: params.serviceId,
      professionalId: params.professionalId,
      date: params.date,
      userId: (user.user as any).id,
    },
  })

  revalidatePath("/barbershops/[id]")
  revalidatePath("/bookings")
  revalidatePath("/barbershop-dashboard")
}
