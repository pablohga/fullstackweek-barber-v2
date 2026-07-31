"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateBarbershopParams {
  name: string
  address: string
  phones: string[]
  description: string
  imageUrl: string
}

export const createBarbershop = async (params: CreateBarbershopParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const barbershop = await db.barbershop.create({
    data: {
      name: params.name,
      address: params.address,
      phones: params.phones,
      description: params.description,
      imageUrl: params.imageUrl,
      userId: (session.user as any).id,
    },
  })

  revalidatePath("/barbershop-dashboard")
  revalidatePath("/")
  return barbershop
}
