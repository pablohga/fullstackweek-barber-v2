"use server"

import { db } from "../_lib/prisma"

export const getScheduleBlocks = async (professionalId: string) => {
  if (!professionalId) return []
  return db.scheduleBlock.findMany({
    where: { professionalId },
    orderBy: { date: "asc" },
  })
}
