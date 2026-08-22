"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateScheduleBlockParams {
  professionalId: string
  date: Date
  startTime?: string | null
  endTime?: string | null
  reason?: string | null
}

export const createScheduleBlock = async (
  params: CreateScheduleBlockParams,
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const professional = await db.professional.findUnique({
    where: { id: params.professionalId },
    include: { barbershop: true },
  })

  if (
    !professional ||
    professional.barbershop.userId !== (session.user as any).id
  ) {
    throw new Error("Unauthorized or Professional not found")
  }

  const block = await db.scheduleBlock.create({
    data: {
      professionalId: params.professionalId,
      date: params.date,
      startTime: params.startTime || null,
      endTime: params.endTime || null,
      reason: params.reason || null,
    },
  })

  revalidatePath("/barbershops", "layout")
  revalidatePath("/barbershop-dashboard")
  return block
}
