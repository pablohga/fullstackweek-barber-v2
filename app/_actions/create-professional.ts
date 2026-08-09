"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateProfessionalParams {
  barbershopId: string
  name: string
  imageUrl?: string
}

export const createProfessional = async (params: CreateProfessionalParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: params.barbershopId },
  })

  if (!barbershop || barbershop.userId !== (session.user as any).id) {
    throw new Error("Unauthorized or Barbershop not found")
  }

  const professional = await db.professional.create({
    data: {
      name: params.name,
      imageUrl:
        params.imageUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
      barbershopId: params.barbershopId,
    },
  })

  revalidatePath(`/barbershops/${params.barbershopId}`)
  revalidatePath("/barbershop-dashboard")
  return professional
}
