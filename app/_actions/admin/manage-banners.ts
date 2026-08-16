"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { revalidatePath } from "next/cache"
import { DEFAULT_BANNERS } from "@/app/_constants/banners"

export const getBanners = async () => {
  const dbBanners = await db.banner.findMany({
    orderBy: { order: "asc" },
  })

  // We want exactly 3 banner slots (index 0, 1, 2)
  const result = [0, 1, 2].map((index) => {
    const existing = dbBanners.find((b) => b.order === index)
    if (existing) {
      return {
        id: existing.id,
        imageUrl: existing.imageUrl,
        title: existing.title || DEFAULT_BANNERS[index].title,
        linkUrl: existing.linkUrl || "",
        order: index,
        isCustom: true,
      }
    }
    return {
      ...DEFAULT_BANNERS[index],
      linkUrl: "",
      isCustom: false,
    }
  })

  return result
}

interface UpsertBannerParams {
  order: number
  imageUrl: string
  title?: string
  linkUrl?: string
}

export const upsertBanner = async (params: UpsertBannerParams) => {
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

  const existing = await db.banner.findFirst({
    where: { order: params.order },
  })

  if (existing) {
    await db.banner.update({
      where: { id: existing.id },
      data: {
        imageUrl: params.imageUrl,
        title: params.title || "",
        linkUrl: params.linkUrl || "",
      },
    })
  } else {
    await db.banner.create({
      data: {
        order: params.order,
        imageUrl: params.imageUrl,
        title: params.title || "",
        linkUrl: params.linkUrl || "",
      },
    })
  }

  revalidatePath("/admin")
  revalidatePath("/landingB")
  return { success: true }
}

export const resetBanner = async (order: number) => {
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

  await db.banner.deleteMany({
    where: { order },
  })

  revalidatePath("/admin")
  revalidatePath("/landingB")
  return { success: true }
}
