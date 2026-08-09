"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

interface UpdateMyProfileParams {
  name: string
  email: string
  phone?: string
  whatsapp?: string
  address?: string
  image?: string
}

export const updateMyProfile = async (params: UpdateMyProfileParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const userId = (session.user as any).id

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      name: params.name,
      email: params.email,
      phone: params.phone,
      whatsapp: params.whatsapp,
      address: params.address,
      image: params.image,
    },
  })

  revalidatePath("/profile")
  revalidatePath("/")
  return updatedUser
}
