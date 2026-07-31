"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

interface UpdatePasswordParams {
  userId: string
  newPassword: string
}

export const updatePassword = async (params: UpdatePasswordParams) => {
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

  const hashedPassword = await bcrypt.hash(params.newPassword, 10)

  const user = await db.user.update({
    where: { id: params.userId },
    data: {
      password: hashedPassword,
    },
  })

  revalidatePath("/admin")
  return user
}
