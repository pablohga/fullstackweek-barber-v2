"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

interface CreateBarbershopAccountParams {
  userId?: string
  barbershopName: string
  ownerName?: string
  address: string
  complement?: string
  state: string
  city: string
  phone: string
  whatsapp: string
  email?: string
  password?: string
  confirmPassword?: string
  billingPeriod?: string
  billingAmount?: string
}

export const createBarbershopAccount = async (
  params: CreateBarbershopAccountParams,
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

  let targetUserId = params.userId

  if (!targetUserId) {
    if (!params.email || !params.password || !params.confirmPassword) {
      throw new Error("Preencha todos os campos obrigatórios de acesso.")
    }
    if (params.password !== params.confirmPassword) {
      throw new Error("As senhas não coincidem.")
    }
    const existingUser = await db.user.findUnique({
      where: { email: params.email },
    })
    if (existingUser) {
      throw new Error("E-mail já cadastrado.")
    }
    const hashedPassword = await bcrypt.hash(params.password, 10)
    const newUser = await db.user.create({
      data: {
        name: params.ownerName || "Barbearia",
        email: params.email,
        password: hashedPassword,
        phone: params.phone,
        whatsapp: params.whatsapp,
        address: fullAddress,
        role: "BARBERSHOP",
      },
    })
    targetUserId = newUser.id
  }

  await db.barbershop.create({
    data: {
      name: params.barbershopName,
      address: fullAddress,
      phones: [params.phone, params.whatsapp].filter(Boolean) as string[],
      description: `Plano: ${params.billingPeriod || "Mensal"} - R$ ${params.billingAmount || "39,00"}`,
      imageUrl:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop",
      userId: targetUserId,
    },
  })

  revalidatePath("/admin")
  revalidatePath("/")
  revalidatePath("/barbershops")
  return { success: true }
}
