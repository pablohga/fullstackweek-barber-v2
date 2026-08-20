import { NextResponse } from "next/server"
import { stripe } from "@/app/_lib/stripe"
import { db } from "@/app/_lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } else {
      // If no webhook secret is set in dev, parse JSON directly (fallback)
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 },
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const barbershopId = session.metadata?.barbershopId
        const subscriptionId = session.subscription as string

        if (barbershopId && subscriptionId) {
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId)
          await db.barbershop.update({
            where: { id: barbershopId },
            data: {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: subscription.status,
              subscriptionPlanId: subscription.items.data[0]?.price.id,
              isVerified: true, // Verification upon active subscription
            },
          })
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const barbershop = await db.barbershop.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (barbershop) {
          await db.barbershop.update({
            where: { id: barbershop.id },
            data: {
              subscriptionStatus: subscription.status,
              subscriptionPlanId: subscription.items.data[0]?.price.id,
              isVerified:
                subscription.status === "active" ||
                subscription.status === "trialing",
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const barbershop = await db.barbershop.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (barbershop) {
          await db.barbershop.update({
            where: { id: barbershop.id },
            data: {
              subscriptionStatus: "canceled",
              isVerified: false,
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    )
  }
}
