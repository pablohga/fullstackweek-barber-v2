"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { stripe } from "@/app/_lib/stripe"
import { revalidatePath } from "next/cache"

const DEFAULT_FEATURED_PLANS = [
  {
    name: "Destaque por 30 dias",
    price: "R$ 49,90",
    period: "30 dias",
    durationDays: 30,
    description:
      "Apareça no topo da página inicial e receba até 3x mais agendamentos.",
    priceId: "price_featured_30_example",
    features: [
      "Prioridade máxima na busca",
      "Selo de Destaque na Home",
      "Duração de 30 dias",
      "Relatório de visualizações",
    ],
  },
  {
    name: "Destaque por 90 dias",
    price: "R$ 119,90",
    period: "90 dias",
    durationDays: 90,
    description: "Máxima visibilidade com desconto especial para 3 meses.",
    priceId: "price_featured_90_example",
    features: [
      "Todos os benefícios do Destaque 30d",
      "Economia de 20%",
      "Duração prolongada de 3 meses",
      "Suporte exclusivo",
    ],
  },
]

export const getFeaturedPlans = async () => {
  let plans = await db.featuredPlan.findMany({
    orderBy: { durationDays: "asc" },
  })

  if (plans.length === 0) {
    for (const defaultPlan of DEFAULT_FEATURED_PLANS) {
      await db.featuredPlan.create({
        data: defaultPlan,
      })
    }
    plans = await db.featuredPlan.findMany({
      orderBy: { durationDays: "asc" },
    })
  }

  return plans
}

interface UpsertFeaturedPlanParams {
  id?: string
  name: string
  price: string
  period: string
  durationDays: number
  description: string
  priceId: string
  features: string[]
  createStripePrice?: boolean
  unitAmount?: number // in cents, e.g. 4990
}

export const upsertFeaturedPlan = async (params: UpsertFeaturedPlanParams) => {
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

  let finalPriceId = params.priceId

  if (params.createStripePrice && params.unitAmount) {
    try {
      const products = await stripe.products.list({ limit: 1 })
      let productId = products.data[0]?.id

      if (!productId) {
        const product = await stripe.products.create({
          name: "VIZUGO Pro - Pacote de Destaque",
        })
        productId = product.id
      }

      // One-time price for featured promotion
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: params.unitAmount,
        currency: "brl",
        nickname: `${params.name} (${params.price})`,
      })

      finalPriceId = newPrice.id
    } catch (stripeError: any) {
      console.error("Error creating one-time price in Stripe:", stripeError)
      throw new Error(`Erro ao criar preço no Stripe: ${stripeError.message}`)
    }
  }

  const dataToSave = {
    name: params.name,
    price: params.price,
    period: params.period,
    durationDays: params.durationDays,
    description: params.description,
    priceId: finalPriceId,
    features: params.features,
  }

  if (params.id) {
    await db.featuredPlan.update({
      where: { id: params.id },
      data: dataToSave,
    })
  } else {
    await db.featuredPlan.create({
      data: dataToSave,
    })
  }

  revalidatePath("/admin")
  revalidatePath("/barbershop-dashboard")
  revalidatePath("/")
  return { success: true }
}

export const deleteFeaturedPlan = async (id: string) => {
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

  await db.featuredPlan.delete({
    where: { id },
  })

  revalidatePath("/admin")
  revalidatePath("/barbershop-dashboard")
  revalidatePath("/")
  return { success: true }
}
