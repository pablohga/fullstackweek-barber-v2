"use client"

import { useState } from "react"
import { SparklesIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/_components/ui/button"

interface FeaturedPlan {
  id: string
  name: string
  price: string
  period: string
  durationDays: number
  description: string
  priceId: string
  features: string[]
}

interface FeaturedPlansSectionProps {
  barbershopId: string
  featuredUntil: string | null
  plans: FeaturedPlan[]
}

export function FeaturedPlansSection({
  barbershopId,
  featuredUntil,
  plans,
}: FeaturedPlansSectionProps) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const isCurrentlyFeatured =
    featuredUntil && new Date(featuredUntil) > new Date()

  const handleCheckoutFeatured = async (plan: FeaturedPlan) => {
    try {
      setLoadingPriceId(plan.priceId)
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId,
          priceId: plan.priceId,
          isFeatured: true,
          durationDays: plan.durationDays,
          featuredPlanId: plan.id,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao iniciar pagamento do Destaque.")
      }
    } catch (error) {
      console.error(error)
      toast.error("Erro de conexão ao processar pagamento.")
    } finally {
      setLoadingPriceId(null)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Impulsionar e Destacar Perfil</h3>
        </div>
        {isCurrentlyFeatured ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Destaque ativo até{" "}
            {new Date(featuredUntil).toLocaleDateString("pt-BR")}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Sem destaque ativo no momento
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Apareça no topo da página inicial e ganhe muito mais visibilidade e
        agendamentos. Escolha um pacote de destaque abaixo:
      </p>

      {plans.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">
          Nenhum pacote de destaque disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-background p-5 shadow-sm transition-all hover:border-primary/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-muted-foreground">
                    {plan.name}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    +{plan.durationDays} dias
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">
                    / {plan.period}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {plan.description}
                </p>
                <ul className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                  {plan.features?.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleCheckoutFeatured(plan)}
                disabled={loadingPriceId === plan.priceId}
                className="w-full gap-2"
              >
                {loadingPriceId === plan.priceId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SparklesIcon className="h-4 w-4" />
                )}
                Contratar Destaque
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
