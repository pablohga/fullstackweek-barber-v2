"use server"

import { db } from "../_lib/prisma"

export const getWorkingHours = async (professionalId: string) => {
  if (!professionalId) return []
  return db.workingHours.findMany({
    where: { professionalId },
    orderBy: { weekday: "asc" },
  })
}
