"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateUserParams {
  userId: string
  name: string
  email: string
  role: string
}

export const updateUser = async (params: UpdateUserParams) => {
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

  const user = await db.user.update({
    where: { id: params.userId },
    data: {
      name: params.name,
      email: params.email,
      role: params.role,
    },
  })

  revalidatePath("/admin")
  return user
}
