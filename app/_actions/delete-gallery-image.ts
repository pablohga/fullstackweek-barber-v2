"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"

export const deleteGalleryImage = async (imageId: string) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const userId = (session.user as any).id

  const image = await db.userGalleryImage.findUnique({
    where: { id: imageId },
  })

  if (!image || image.userId !== userId) {
    throw new Error("Unauthorized or image not found")
  }

  await db.userGalleryImage.delete({
    where: { id: imageId },
  })

  revalidatePath("/profile")
}
