"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface WorkingHourInput {
  weekday: number
  isOpen: boolean
  startTime: string
  endTime: string
  breakStart?: string | null
  breakEnd?: string | null
}

interface SetWorkingHoursParams {
  professionalId: string
  workingHours: WorkingHourInput[]
}

export const setWorkingHours = async (params: SetWorkingHoursParams) => {
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

  for (const wh of params.workingHours) {
    await db.workingHours.upsert({
      where: {
        professionalId_weekday: {
          professionalId: params.professionalId,
          weekday: wh.weekday,
        },
      },
      update: {
        isOpen: wh.isOpen,
        startTime: wh.startTime,
        endTime: wh.endTime,
        breakStart: wh.breakStart || null,
        breakEnd: wh.breakEnd || null,
      },
      create: {
        professionalId: params.professionalId,
        weekday: wh.weekday,
        isOpen: wh.isOpen,
        startTime: wh.startTime,
        endTime: wh.endTime,
        breakStart: wh.breakStart || null,
        breakEnd: wh.breakEnd || null,
      },
    })
  }

  revalidatePath("/barbershops", "layout")
  revalidatePath("/barbershop-dashboard")
}
