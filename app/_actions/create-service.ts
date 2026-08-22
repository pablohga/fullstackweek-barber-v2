"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateServiceParams {
  barbershopId: string
  name: string
  description: string
  price: number
  imageUrl: string
}

export const createService = async (params: CreateServiceParams) => {
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

  const service = await db.barbershopService.create({
    data: {
      name: params.name,
      description: params.description,
      price: params.price,
      imageUrl: params.imageUrl,
      barbershopId: params.barbershopId,
    },
  })

  revalidatePath("/barbershops", "layout")
  revalidatePath("/barbershop-dashboard")
  return service
}
