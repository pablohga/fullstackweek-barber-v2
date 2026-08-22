"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { revalidatePath } from "next/cache"

interface CreateReviewParams {
  barbershopId: string
  rating: number
  comment?: string
}

export const createReview = async (params: CreateReviewParams) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const review = await db.review.create({
    data: {
      rating: params.rating,
      comment: params.comment,
      userId: (session.user as any).id,
      barbershopId: params.barbershopId,
    },
  })

  revalidatePath("/barbershops", "layout")
  return review
}
