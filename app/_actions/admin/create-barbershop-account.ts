"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

interface CreateBarbershopAccountParams {
  name: string
  email: string
  password: string
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
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const existingUser = await db.user.findUnique({
    where: { email: params.email },
  })

  if (existingUser) {
    throw new Error("E-mail já cadastrado.")
  }

  const hashedPassword = await bcrypt.hash(params.password, 10)

  const user = await db.user.create({
    data: {
      name: params.name,
      email: params.email,
      password: hashedPassword,
      role: "BARBERSHOP",
    },
  })

  revalidatePath("/admin")
  return user
}
