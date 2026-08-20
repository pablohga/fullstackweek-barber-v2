"use client"

import { useState } from "react"
import { CheckIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PricingPlan {
  id: string
  name: string
  price: string
  period: string
  description: string
  badge?: string | null
  priceId: string
  features: string[]
  highlighted: boolean
  order: number
}

interface PricingCardsProps {
  barbershopId?: string
  plans?: PricingPlan[]
}

export function PricingCards({ barbershopId, plans = [] }: PricingCardsProps) {
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (priceId: string) => {
    if (!barbershopId) {
      toast.error(
        "Você precisa estar logado e ter um estabelecimento cadastrado para assinar.",
      )
      router.push("/barbershop-dashboard")
      return
    }

    try {
      setLoadingPrice(priceId)
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barbershopId, priceId }),
      })

      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao iniciar pagamento no Stripe.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro de conexão ao processar pagamento.")
    } finally {
      setLoadingPrice(null)
    }
  }

  // Fallback defaults if plans array is empty
  const displayPlans = plans.length > 0 ? plans : []

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
      {displayPlans.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col justify-between space-y-8 rounded-3xl p-8 ${
            plan.highlighted
              ? "border-2 border-amber-400 bg-zinc-950 shadow-2xl shadow-amber-400/5"
              : "border border-zinc-800 bg-zinc-950/60"
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-black">
              {plan.badge}
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="font-mono text-sm uppercase text-amber-400">
              {plan.name}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-light text-white">
                {plan.price}
              </span>
              <span className="font-mono text-sm text-zinc-500">
                {plan.period}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{plan.description}</p>
          </div>

          <ul className="space-y-3 border-t border-zinc-900 pt-6 text-sm font-light text-zinc-300">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckIcon size={16} className="text-amber-400" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loadingPrice === plan.priceId}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-medium transition-all ${
              plan.highlighted
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 hover:bg-amber-300"
                : "border border-zinc-700 bg-transparent text-white hover:bg-zinc-800"
            }`}
          >
            {loadingPrice === plan.priceId && (
              <Loader2Icon size={16} className="animate-spin" />
            )}
            Assinar {plan.name}
          </button>
        </div>
      ))}
    </div>
  )
}
