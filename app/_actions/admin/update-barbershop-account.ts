"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateBarbershopAccountParams {
  userId: string
  barbershopName: string
  ownerName: string
  address: string
  complement?: string
  state: string
  city: string
  phone: string
  whatsapp: string
  email: string
  billingPeriod?: string
  billingAmount?: string
  isVerified?: boolean
  featuredUntil?: string | null
}

export const updateBarbershopAccount = async (
  params: UpdateBarbershopAccountParams,
) => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }
  const dbUser = await db.user.findUnique({
    where: { email: session.user.email },
  })
  const sessionRole = (session.user as any).role
  if (!dbUser || (sessionRole !== "ADMIN" && dbUser.role !== "ADMIN")) {
    throw new Error("Unauthorized")
  }

  const fullAddress = `${params.address}${params.complement ? ", " + params.complement : ""}, ${params.city} - ${params.state}`

  const updatedUser = await db.user.update({
    where: { id: params.userId },
    data: {
      name: params.ownerName,
      email: params.email,
      phone: params.phone,
      whatsapp: params.whatsapp,
      address: fullAddress,
    },
  })

  const existingBarbershop = await db.barbershop.findFirst({
    where: { userId: params.userId },
  })

  if (existingBarbershop) {
    await db.barbershop.update({
      where: { id: existingBarbershop.id },
      data: {
        name: params.barbershopName,
        address: fullAddress,
        phones: [params.phone, params.whatsapp].filter(Boolean) as string[],
        description: `Plano: ${params.billingPeriod || "Mensal"} - R$ ${params.billingAmount || "39,00"}`,
        isVerified: params.isVerified ?? false,
        featuredUntil: params.featuredUntil
          ? new Date(params.featuredUntil)
          : null,
      },
    })
  } else {
    await db.barbershop.create({
      data: {
        name: params.barbershopName,
        address: fullAddress,
        phones: [params.phone, params.whatsapp].filter(Boolean) as string[],
        description: `Plano: ${params.billingPeriod || "Mensal"} - R$ ${params.billingAmount || "39,00"}`,
        imageUrl:
          "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop",
        userId: params.userId,
        isVerified: params.isVerified ?? false,
        featuredUntil: params.featuredUntil
          ? new Date(params.featuredUntil)
          : null,
      },
    })
  }

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/barbershops")
  return updatedUser
}
