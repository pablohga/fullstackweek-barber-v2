import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { stripe } from "@/app/_lib/stripe"
import { db } from "@/app/_lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { barbershopId, priceId } = await request.json()

    if (!barbershopId) {
      return NextResponse.json(
        { error: "Barbershop ID is required" },
        { status: 400 },
      )
    }

    const barbershop = await db.barbershop.findUnique({
      where: { id: barbershopId },
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: "Estabelecimento não encontrado" },
        { status: 404 },
      )
    }

    // Default subscription price ID or fallback
    const selectedPriceId =
      priceId ||
      process.env.STRIPE_SUBSCRIPTION_PRICE_ID ||
      "price_1U5dK50YGyaOU6ueExample"

    const origin = request.headers.get("origin") || "http://localhost:3000"

    // Create or retrieve Stripe Customer
    let customerId = barbershop.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        name: barbershop.name,
        metadata: {
          barbershopId: barbershop.id,
          userId: (session.user as any).id,
        },
      })
      customerId = customer.id
      await db.barbershop.update({
        where: { id: barbershopId },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/barbershop-dashboard?success=true`,
      cancel_url: `${origin}/barbershop-dashboard?canceled=true`,
      metadata: {
        barbershopId: barbershop.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    )
  }
}
