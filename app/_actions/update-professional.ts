"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateProfessionalParams {
  professionalId: string
  name?: string
  imageUrl?: string
  active?: boolean
}

export const updateProfessional = async (params: UpdateProfessionalParams) => {
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

  const updated = await db.professional.update({
    where: { id: params.professionalId },
    data: {
      name: params.name !== undefined ? params.name : professional.name,
      imageUrl:
        params.imageUrl !== undefined ? params.imageUrl : professional.imageUrl,
      active: params.active !== undefined ? params.active : professional.active,
    },
  })

  revalidatePath(`/barbershops/${professional.barbershopId}`)
  revalidatePath("/barbershop-dashboard")
  return updated
}
