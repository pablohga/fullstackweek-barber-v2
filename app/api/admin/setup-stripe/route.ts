import { NextResponse } from "next/server"
import { stripe } from "@/app/_lib/stripe"

export async function GET() {
  try {
    // 1. Create Product for Estabelecimento
    const product = await stripe.products.create({
      name: "VIZUGO Pro - Assinatura para Estabelecimentos",
      description:
        "Plataforma completa de gestão, agendamento e automação para estabelecimentos.",
    })

    // 2. Create Prices
    // Monthly: R$ 39,90
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 3990, // R$ 39.90
      currency: "brl",
      recurring: {
        interval: "month",
        interval_count: 1,
      },
      nickname: "Mensal (R$ 39,90)",
    })

    // 6 Months (Semestral - 10% discount): R$ 39.90 * 6 * 0.90 = 215.46 -> 21546 cents
    const semestralPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 21546,
      currency: "brl",
      recurring: {
        interval: "month",
        interval_count: 6,
      },
      nickname: "Semestral - 10% desc (R$ 35,91/mês)",
    })

    // 12 Months (Anual - 15% discount): R$ 39.90 * 12 * 0.85 = 407.04 -> 40704 cents
    const annualPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: 40704,
      currency: "brl",
      recurring: {
        interval: "year",
        interval_count: 1,
      },
      nickname: "Anual - 15% desc (R$ 33,92/mês)",
    })

    return NextResponse.json({
      success: true,
      message: "Produtos e preços criados com sucesso no Stripe!",
      productId: product.id,
      prices: {
        monthly: monthlyPrice.id,
        semestral: semestralPrice.id,
        annual: annualPrice.id,
      },
      instructions:
        "Adicione estes IDs aos planos na landing page ou variáveis de ambiente se necessário.",
    })
  } catch (error: any) {
    console.error("Error setting up Stripe products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
