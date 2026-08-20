"import client"
"use client"

import { useState } from "react"
import { CheckIcon, Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PricingCardsProps {
  barbershopId?: string
}

export function PricingCards({ barbershopId }: PricingCardsProps) {
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

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
      {/* Mensal */}
      <div className="relative flex flex-col justify-between space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-8">
        <div className="space-y-4">
          <div className="font-mono text-sm uppercase text-zinc-400">
            Mensal
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light text-white">R$ 39,90</span>
            <span className="font-mono text-sm text-zinc-500">/ mês</span>
          </div>
          <p className="text-xs text-zinc-400">
            Cobrado mensalmente. Sem fidelidade.
          </p>
        </div>

        <ul className="space-y-3 border-t border-zinc-900 pt-6 text-sm font-light text-zinc-300">
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Agenda online 24/7</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Página própria do estabelecimento</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Gestão de equipe e serviços</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Notificações automáticas</span>
          </li>
        </ul>

        <button
          onClick={() => handleSubscribe("price_1U5yIz0YGyaOU6uebYdxgtlR")}
          disabled={loadingPrice === "price_1U5yIz0YGyaOU6uebYdxgtlR"}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-transparent py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
        >
          {loadingPrice === "price_1U5yIz0YGyaOU6uebYdxgtlR" && (
            <Loader2Icon size={16} className="animate-spin" />
          )}
          Assinar Mensal
        </button>
      </div>

      {/* Semestral (6 meses - 10% desc) */}
      <div className="relative flex flex-col justify-between space-y-8 rounded-3xl border-2 border-amber-400 bg-zinc-950 p-8 shadow-2xl shadow-amber-400/5">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-black">
          10% de Desconto
        </div>

        <div className="space-y-4 pt-2">
          <div className="font-mono text-sm uppercase text-amber-400">
            Semestral (6 meses)
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light text-white">R$ 35,91</span>
            <span className="font-mono text-sm text-zinc-500">/ mês</span>
          </div>
          <p className="text-xs text-zinc-400">
            R$ 215,46 cobrados a cada 6 meses.
          </p>
        </div>

        <ul className="space-y-3 border-t border-zinc-900 pt-6 text-sm font-light text-zinc-300">
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Todos os recursos do Mensal</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Economia de 10% garantida</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Relatórios financeiros avançados</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Suporte prioritário</span>
          </li>
        </ul>

        <button
          onClick={() => handleSubscribe("price_1U5yJ00YGyaOU6uecfLCQMyD")}
          disabled={loadingPrice === "price_1U5yJ00YGyaOU6uecfLCQMyD"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3.5 text-sm font-medium text-black shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300"
        >
          {loadingPrice === "price_1U5yJ00YGyaOU6uecfLCQMyD" && (
            <Loader2Icon size={16} className="animate-spin" />
          )}
          Assinar Semestral
        </button>
      </div>

      {/* Anual (12 meses - 15% desc) */}
      <div className="relative flex flex-col justify-between space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 p-8">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-zinc-800 px-4 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
          15% de Desconto
        </div>

        <div className="space-y-4 pt-2">
          <div className="font-mono text-sm uppercase text-zinc-400">
            Anual (12 meses)
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light text-white">R$ 33,92</span>
            <span className="font-mono text-sm text-zinc-500">/ mês</span>
          </div>
          <p className="text-xs text-zinc-400">
            R$ 407,04 cobrados anualmente.
          </p>
        </div>

        <ul className="space-y-3 border-t border-zinc-900 pt-6 text-sm font-light text-zinc-300">
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Todos os recursos do Semestral</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Máxima economia (15% off)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Atendimento VIP dedicado</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={16} className="text-amber-400" />
            <span>Selo de Estabelecimento Verificado</span>
          </li>
        </ul>

        <button
          onClick={() => handleSubscribe("price_1U5yJ00YGyaOU6ueyOOTRp6p")}
          disabled={loadingPrice === "price_1U5yJ00YGyaOU6ueyOOTRp6p"}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-transparent py-3.5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
        >
          {loadingPrice === "price_1U5yJ00YGyaOU6ueyOOTRp6p" && (
            <Loader2Icon size={16} className="animate-spin" />
          )}
          Assinar Anual
        </button>
      </div>
    </div>
  )
}
