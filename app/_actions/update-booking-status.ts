"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateBookingStatusParams {
  bookingId: string
  status: "CONFIRMED" | "CANCELLED" | "FINISHED"
}

export const updateBookingStatus = async (
  params: UpdateBookingStatusParams,
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const booking = await db.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      service: {
        include: {
          barbershop: true,
        },
      },
    },
  })

  if (!booking) {
    throw new Error("Booking not found")
  }

  const isOwner = booking.service.barbershop.userId === (session.user as any).id
  const isClient = booking.userId === (session.user as any).id

  if (!isOwner && !isClient) {
    throw new Error("Unauthorized")
  }

  const updatedBooking = await db.booking.update({
    where: { id: params.bookingId },
    data: { status: params.status },
  })

  revalidatePath("/bookings")
  revalidatePath("/barbershop-dashboard")
  return updatedBooking
}
