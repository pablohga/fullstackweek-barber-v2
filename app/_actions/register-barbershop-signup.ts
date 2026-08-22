"use server"

import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

interface RegisterBarbershopSignupParams {
  barbershopName: string
  types: string[]
  ownerName: string
  email: string
  phone: string
  whatsapp?: string
  address: string
  city: string
  state: string
  password: string
  confirmPassword: string
  imageUrl?: string
}

export const registerBarbershopSignup = async (
  params: RegisterBarbershopSignupParams,
) => {
  if (
    !params.barbershopName ||
    !params.email ||
    !params.password ||
    !params.confirmPassword ||
    !params.address ||
    !params.city ||
    !params.state ||
    !params.phone
  ) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  if (params.password !== params.confirmPassword) {
    throw new Error("As senhas não coincidem.")
  }

  const existingUser = await db.user.findUnique({
    where: { email: params.email },
  })

  if (existingUser) {
    throw new Error("E-mail já cadastrado no sistema.")
  }

  const hashedPassword = await bcrypt.hash(params.password, 10)

  const fullAddress = `${params.address}, ${params.city} - ${params.state}`
  const categoriesDescription =
    params.types.length > 0
      ? `Tipos: ${params.types.join(", ")}`
      : "Estabelecimento de Beleza e Estética"

  // Create user with BARBERSHOP role
  const newUser = await db.user.create({
    data: {
      name: params.ownerName,
      email: params.email,
      password: hashedPassword,
      phone: params.phone,
      whatsapp: params.whatsapp || params.phone,
      address: fullAddress,
      role: "BARBERSHOP",
    },
  })

  // Create barbershop record linked to user, initially inactive (0 days available)
  const barbershop = await db.barbershop.create({
    data: {
      name: params.barbershopName,
      address: fullAddress,
      phones: [params.phone, params.whatsapp].filter(Boolean) as string[],
      description: categoriesDescription,
      imageUrl:
        params.imageUrl ||
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000&auto=format&fit=crop",
      userId: newUser.id,
      subscriptionStatus: "inactive",
    },
  })

  revalidatePath("/signup")
  revalidatePath("/barbershop-dashboard")

  return {
    success: true,
    barbershopId: barbershop.id,
    userId: newUser.id,
  }
}
