"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import {
  notifyBookingConfirmation,
  notifyBookingCancellation,
} from "../_lib/notifications"
import { revalidatePath } from "next/cache"

interface ResendBookingNotificationParams {
  bookingId: string
}

export const resendBookingNotification = async (
  params: ResendBookingNotificationParams,
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const booking = await db.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      user: true,
      service: {
        include: {
          barbershop: true,
        },
      },
      professional: true,
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

  if (!booking.user || !booking.service) {
    throw new Error("Invalid booking data for notification")
  }

  const notificationData = {
    clientName: booking.user.name || "Cliente",
    clientEmail: booking.user.email,
    clientPhone: booking.user.phone,
    clientWhatsapp: booking.user.whatsapp,
    barbershopName: booking.service.barbershop.name,
    serviceName: booking.service.name,
    professionalName: booking.professional?.name,
    date: booking.date,
    cancelledBy: "barbershop" as const,
  }

  if (booking.status === "CANCELLED") {
    await notifyBookingCancellation(notificationData)
  } else {
    await notifyBookingConfirmation(notificationData)
  }

  revalidatePath("/bookings")
  revalidatePath("/barbershop-dashboard")
  return { success: true }
}
