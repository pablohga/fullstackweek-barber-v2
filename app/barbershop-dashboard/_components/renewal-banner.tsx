"use client"

import { useState } from "react"
import { AlertTriangle, Lock, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Plan {
  id: string
  name: string
  price: string
  period: string
  priceId: string
}

interface RenewalBannerProps {
  barbershopId: string
  daysRemaining: number | null
  isDelinquent: boolean
  plans: Plan[]
}

export function RenewalBanner({
  barbershopId,
  daysRemaining,
  isDelinquent,
  plans,
}: RenewalBannerProps) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleCheckout = async (priceId: string) => {
    try {
      setLoadingPriceId(priceId)
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barbershopId, priceId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao iniciar pagamento.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro de conexão ao processar pagamento.")
    } finally {
      setLoadingPriceId(null)
    }
  }

  // Default priceId if plans list is empty
  const defaultPriceId =
    plans[0]?.priceId ||
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ||
    "price_1U5yIz0YGyaOU6uebYdxgtlR"

  if (isDelinquent) {
    return (
      <div className="rounded-2xl border-2 border-red-500/50 bg-red-950/40 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/25 text-red-400">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">
              Conta de Estabelecimento Bloqueada
            </h2>
            <p className="max-w-xl text-sm text-red-200/80">
              Sua assinatura venceu ou encontra-se inadimplente. Todos os
              recursos e benefícios do painel estão temporariamente bloqueados.
              Para reativar sua conta e recuperar o acesso, por favor realize o
              pagamento da renovação.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={loadingPriceId === plan.priceId}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 disabled:opacity-50"
                >
                  {loadingPriceId === plan.priceId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Renovar Plano {plan.name} ({plan.price} {plan.period})
                </button>
              ))
            ) : (
              <button
                onClick={() => handleCheckout(defaultPriceId)}
                disabled={loadingPriceId === defaultPriceId}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-500 disabled:opacity-50"
              >
                {loadingPriceId === defaultPriceId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Realizar Pagamento de Renovação
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0) {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Atenção: Sua assinatura vence em {daysRemaining} dia
                {daysRemaining > 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-amber-200/70">
                Renove antecipadamente para evitar a interrupção dos recursos e
                bloqueio da conta.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {plans.length > 0 ? (
              plans.slice(0, 1).map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={loadingPriceId === plan.priceId}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-400 disabled:opacity-55"
                >
                  {loadingPriceId === plan.priceId && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Renovar Agora ({plan.price})
                </button>
              ))
            ) : (
              <button
                onClick={() => handleCheckout(defaultPriceId)}
                disabled={loadingPriceId === defaultPriceId}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-amber-400 disabled:opacity-50"
              >
                {loadingPriceId === defaultPriceId && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Renovar Agora
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
