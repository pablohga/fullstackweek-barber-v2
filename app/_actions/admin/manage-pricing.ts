"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { stripe } from "@/app/_lib/stripe"
import { revalidatePath } from "next/cache"

const DEFAULT_PLANS = [
  {
    name: "Mensal",
    price: "R$ 39,90",
    period: "/ mês",
    description: "Cobrado mensalmente. Sem fidelidade.",
    badge: null,
    priceId: "price_1U5yIz0YGyaOU6uebYdxgtlR",
    features: [
      "Agenda online 24/7",
      "Página própria do estabelecimento",
      "Gestão de equipe e serviços",
      "Notificações automáticas",
    ],
    highlighted: false,
    order: 0,
  },
  {
    name: "Semestral (6 meses)",
    price: "R$ 35,91",
    period: "/ mês",
    description: "R$ 215,46 cobrados a cada 6 meses.",
    badge: "10% de Desconto",
    priceId: "price_1U5yIz0YGyaOU6uecfLCQMyD",
    features: [
      "Todos os recursos do Mensal",
      "Economia de 10% garantida",
      "Relatórios financeiros avançados",
      "Suporte prioritário",
    ],
    highlighted: true,
    order: 1,
  },
  {
    name: "Anual (12 meses)",
    price: "R$ 33,92",
    period: "/ mês",
    description: "R$ 407,04 cobrados anualmente.",
    badge: "15% de Desconto",
    priceId: "price_1U5yIz0YGyaOU6ueyOOTRp6p",
    features: [
      "Todos os recursos do Semestral",
      "Máxima economia (15% off)",
      "Atendimento VIP dedicado",
      "Selo de Estabelecimento Verificado",
    ],
    highlighted: false,
    order: 2,
  },
]

export const getPricingPlans = async () => {
  let plans = await db.pricingPlan.findMany({
    orderBy: { order: "asc" },
  })

  if (plans.length === 0) {
    // Seed defaults
    for (const defaultPlan of DEFAULT_PLANS) {
      await db.pricingPlan.create({
        data: defaultPlan,
      })
    }
    plans = await db.pricingPlan.findMany({
      orderBy: { order: "asc" },
    })
  }

  return plans
}

interface UpsertPlanParams {
  id?: string
  name: string
  price: string
  period: string
  description: string
  badge?: string | null
  priceId: string
  features: string[]
  highlighted: boolean
  order: number
  // Optional Stripe auto-creation params if admin wants to create a new price on Stripe directly
  createStripePrice?: boolean
  unitAmount?: number // in cents, e.g. 3990
  interval?: "month" | "year"
  intervalCount?: number
}

export const upsertPricingPlan = async (params: UpsertPlanParams) => {
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

  // If admin requested creating/updating on Stripe
  if (params.createStripePrice && params.unitAmount && params.interval) {
    try {
      // Find or create product
      const products = await stripe.products.list({ limit: 1 })
      let productId = products.data[0]?.id

      if (!productId) {
        const product = await stripe.products.create({
          name: "VIZUGO Pro - Assinatura para Estabelecimentos",
        })
        productId = product.id
      }

      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: params.unitAmount,
        currency: "brl",
        recurring: {
          interval: params.interval,
          interval_count: params.intervalCount || 1,
        },
        nickname: `${params.name} (${params.price})`,
      })

      finalPriceId = newPrice.id
    } catch (stripeError: any) {
      console.error("Error creating price in Stripe:", stripeError)
      throw new Error(`Erro ao atualizar no Stripe: ${stripeError.message}`)
    }
  }

  const dataToSave = {
    name: params.name,
    price: params.price,
    period: params.period,
    description: params.description,
    badge: params.badge || null,
    priceId: finalPriceId,
    features: params.features,
    highlighted: params.highlighted,
    order: params.order,
  }

  if (params.id) {
    await db.pricingPlan.update({
      where: { id: params.id },
      data: dataToSave,
    })
  } else {
    await db.pricingPlan.create({
      data: dataToSave,
    })
  }

  revalidatePath("/admin")
  revalidatePath("/landingc")
  revalidatePath("/")
  return { success: true }
}

export const deletePricingPlan = async (id: string) => {
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

  await db.pricingPlan.delete({
    where: { id },
  })

  revalidatePath("/admin")
  revalidatePath("/landingc")
  revalidatePath("/")
  return { success: true }
}
