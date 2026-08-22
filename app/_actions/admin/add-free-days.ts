"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

interface AddFreeDaysParams {
  userId: string
  days: number
}

export const addFreeDays = async (params: AddFreeDaysParams) => {
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

  const barbershop = await db.barbershop.findFirst({
    where: { userId: params.userId },
  })

  if (!barbershop) {
    throw new Error("Estabelecimento não encontrado para este usuário.")
  }

  const now = new Date()
  const currentEndsAt = barbershop.subscriptionEndsAt
    ? new Date(barbershop.subscriptionEndsAt)
    : null

  const baseDate = currentEndsAt && currentEndsAt > now ? currentEndsAt : now
  const newEndsAt = new Date(
    baseDate.getTime() + params.days * 24 * 60 * 60 * 1000,
  )

  await db.barbershop.update({
    where: { id: barbershop.id },
    data: {
      subscriptionEndsAt: newEndsAt,
      subscriptionStatus: "active",
    },
  })

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/barbershops")
  revalidatePath("/barbershop-dashboard")
  return barbershop
}
