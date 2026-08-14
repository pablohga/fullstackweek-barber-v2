"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { startOfMonth, endOfMonth, parseISO } from "date-fns"

interface GetBarbershopMetricsParams {
  barbershopId: string
  startDate?: string
  endDate?: string
}

export const getBarbershopMetrics = async ({
  barbershopId,
  startDate,
  endDate,
}: GetBarbershopMetricsParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: barbershopId },
    include: {
      services: {
        include: {
          bookings: {
            include: {
              service: true,
              professional: true,
              user: true,
            },
          },
        },
      },
      professionals: true,
    },
  })

  if (!barbershop || barbershop.userId !== (session.user as any).id) {
    throw new Error("Unauthorized")
  }

  const start = startDate ? parseISO(startDate) : startOfMonth(new Date())
  const end = endDate ? parseISO(endDate) : endOfMonth(new Date())

  const allBookings = barbershop.services.flatMap((service) =>
    service.bookings.map((booking) => ({
      ...booking,
      serviceName: service.name,
      servicePrice: Number(service.price),
      professionalName: booking.professional?.name || "Não atribuído",
    })),
  )

  const filteredBookings = allBookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    return bookingDate >= start && bookingDate <= end
  })

  let realizedRevenue = 0
  let projectedRevenue = 0
  let totalConfirmed = 0
  let totalFinished = 0
  let totalCancelled = 0
  let totalExpired = 0

  const now = new Date()

  const serviceStats: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {}
  const professionalStats: Record<
    string,
    { name: string; count: number; revenue: number }
  > = {}
  const hourlyStats: Record<string, number> = {}

  for (const booking of filteredBookings) {
    const bookingDate = new Date(booking.date)
    const isPast = bookingDate < now

    let effectiveStatus = booking.status || "CONFIRMED"
    if (effectiveStatus === "CONFIRMED" && isPast) {
      effectiveStatus = "EXPIRED"
    }

    if (effectiveStatus === "FINISHED") {
      totalFinished++
      realizedRevenue += booking.servicePrice
    } else if (effectiveStatus === "CONFIRMED") {
      totalConfirmed++
      projectedRevenue += booking.servicePrice
    } else if (effectiveStatus === "CANCELLED") {
      totalCancelled++
    } else if (effectiveStatus === "EXPIRED") {
      totalExpired++
    }

    if (!serviceStats[booking.serviceId]) {
      serviceStats[booking.serviceId] = {
        name: booking.serviceName,
        count: 0,
        revenue: 0,
      }
    }
    serviceStats[booking.serviceId].count++
    if (effectiveStatus === "FINISHED" || effectiveStatus === "CONFIRMED") {
      serviceStats[booking.serviceId].revenue += booking.servicePrice
    }

    if (booking.professionalId) {
      if (!professionalStats[booking.professionalId]) {
        professionalStats[booking.professionalId] = {
          name: booking.professionalName,
          count: 0,
          revenue: 0,
        }
      }
      professionalStats[booking.professionalId].count++
      if (effectiveStatus === "FINISHED" || effectiveStatus === "CONFIRMED") {
        professionalStats[booking.professionalId].revenue +=
          booking.servicePrice
      }
    }

    const hourStr = bookingDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const hourKey = hourStr.split(":")[0] + ":00"
    hourlyStats[hourKey] = (hourlyStats[hourKey] || 0) + 1
  }

  const servicesArray = Object.values(serviceStats).sort(
    (a, b) => b.count - a.count,
  )
  const professionalsArray = Object.values(professionalStats).sort(
    (a, b) => b.count - a.count,
  )
  const hourlyArray = Object.entries(hourlyStats)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour))

  const totalBookings = filteredBookings.length

  return {
    realizedRevenue,
    projectedRevenue,
    totalBookings,
    totalFinished,
    totalConfirmed,
    totalCancelled,
    totalExpired,
    servicesArray,
    professionalsArray,
    hourlyArray,
  }
}
