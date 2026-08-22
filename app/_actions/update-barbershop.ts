"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateBarbershopParams {
  id: string
  name: string
  address: string
  phones: string[]
  description: string
  imageUrl: string
}

export const updateBarbershop = async (params: UpdateBarbershopParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    throw new Error("Unauthorized")
  }

  const barbershop = await db.barbershop.findUnique({
    where: { id: params.id },
  })

  if (!barbershop || barbershop.userId !== (session.user as any).id) {
    throw new Error("Estabelecimento não encontrado ou acesso negado")
  }

  const updatedBarbershop = await db.barbershop.update({
    where: { id: params.id },
    data: {
      name: params.name,
      address: params.address,
      phones: params.phones,
      description: params.description,
      imageUrl: params.imageUrl,
    },
  })

  revalidatePath("/barbershop-dashboard")
  revalidatePath("/")
  revalidatePath("/barbershops", "layout")
  return updatedBarbershop
}
