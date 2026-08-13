import { NextResponse } from "next/server"
import { db } from "@/app/_lib/prisma"
import { notifyBookingReminder } from "@/app/_lib/notifications"
import { addHours } from "date-fns"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // 1. Authenticate cron request
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow checking URL query param or header for flexibility
      let url: URL
      try {
        url = new URL(request.url)
      } catch {
        url = new URL(
          request.url || "/",
          `http://${request.headers.get("host") || "localhost"}`,
        )
      }
      const secretQuery = url.searchParams.get("secret")
      if (secretQuery !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const now = new Date()
    // Define reminder window: e.g., bookings happening in 23 to 25 hours from now (24h reminder window)
    // Or simpler: bookings between now and 24h from now that haven't had a reminder sent.
    const targetStart = addHours(now, 23)
    const targetEnd = addHours(now, 25)

    const bookingsToRemind = await db.booking.findMany({
      where: {
        status: "CONFIRMED",
        reminderSentAt: null,
        date: {
          gte: targetStart,
          lte: targetEnd,
        },
      },
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

    let processedCount = 0

    for (const booking of bookingsToRemind) {
      if (!booking.user || !booking.service) continue

      try {
        await notifyBookingReminder({
          clientName: booking.user.name || "Cliente",
          clientEmail: booking.user.email,
          clientPhone: booking.user.phone,
          clientWhatsapp: booking.user.whatsapp,
          barbershopName: booking.service.barbershop.name,
          serviceName: booking.service.name,
          professionalName: booking.professional?.name,
          date: booking.date,
        })

        await db.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt: new Date() },
        })

        processedCount++
      } catch (err) {
        console.error(`[Reminder Error for Booking ${booking.id}]`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} reminder(s).`,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("[Cron Send Reminders Error]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
