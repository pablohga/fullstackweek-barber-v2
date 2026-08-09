"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteUser = async (userId: string) => {
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

  if (
    dbUser.role !== "ADMIN" &&
    (sessionRole === "ADMIN" || session.user.email === "pablohga@gmail.com")
  ) {
    await db.user
      .update({
        where: { id: dbUser.id },
        data: { role: "ADMIN" },
      })
      .catch(() => {})
  }

  await db.user.delete({
    where: { id: userId },
  })

  revalidatePath("/admin")
}
