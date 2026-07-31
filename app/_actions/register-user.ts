"use server"

import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"

interface RegisterUserParams {
  name: string
  email: string
  phone: string
  whatsapp?: string
  address?: string
  password: string
  passwordConfirmation: string
}

export const registerUser = async (params: RegisterUserParams) => {
  if (params.password !== params.passwordConfirmation) {
    throw new Error("As senhas não coincidem.")
  }

  const existingUser = await db.user.findUnique({
    where: { email: params.email },
  })

  if (existingUser) {
    throw new Error("Este e-mail já está em uso.")
  }

  const hashedPassword = await bcrypt.hash(params.password, 10)

  const user = await db.user.create({
    data: {
      name: params.name,
      email: params.email,
      phone: params.phone,
      whatsapp: params.whatsapp,
      address: params.address,
      password: hashedPassword,
      role: "CLIENT",
    },
  })

  return user
}
