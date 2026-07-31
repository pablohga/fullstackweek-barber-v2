"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

export const updateUserRole = async (role: "CLIENT" | "BARBERSHOP") => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await db.user.update({
    where: { id: (session.user as any).id },
    data: { role },
  })

  revalidatePath("/")
  revalidatePath("/profile")
}
