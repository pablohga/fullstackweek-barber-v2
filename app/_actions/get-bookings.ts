"use server"

import { endOfDay, startOfDay } from "date-fns"
import { db } from "../_lib/prisma"

interface GetBookingsProps {
  serviceId?: string
  professionalId?: string
  date: Date
}

export const getBookings = ({ professionalId, date }: GetBookingsProps) => {
  return db.booking.findMany({
    where: {
      professionalId: professionalId || undefined,
      status: "CONFIRMED",
      date: {
        lte: endOfDay(date),
        gte: startOfDay(date),
      },
    },
  })
}
