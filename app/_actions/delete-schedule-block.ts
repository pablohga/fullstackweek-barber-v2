"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteScheduleBlock = async (blockId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const block = await db.scheduleBlock.findUnique({
    where: { id: blockId },
    include: { professional: { include: { barbershop: true } } },
  })

  if (
    !block ||
    block.professional.barbershop.userId !== (session.user as any).id
  ) {
    throw new Error("Unauthorized or Block not found")
  }

  await db.scheduleBlock.delete({
    where: { id: blockId },
  })

  revalidatePath(`/barbershops/${block.professional.barbershopId}`)
  revalidatePath("/barbershop-dashboard")
}
