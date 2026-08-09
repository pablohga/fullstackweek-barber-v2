"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export const addGalleryImage = async (imageUrl: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const userId = (session.user as any).id

  const count = await db.userGalleryImage.count({
    where: { userId },
  })

  if (count >= 6) {
    throw new Error(
      "Limite de 6 imagens atingido. Você deve apagar uma imagem da galeria antes de adicionar uma nova.",
    )
  }

  const image = await db.userGalleryImage.create({
    data: {
      imageUrl,
      userId,
    },
  })

  revalidatePath("/profile")
  return image
}
