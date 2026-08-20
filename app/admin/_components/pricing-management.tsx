"use client"

import { useState } from "react"
import {
  upsertPricingPlan,
  deletePricingPlan,
} from "@/app/_actions/admin/manage-pricing"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { toast } from "sonner"
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  CheckIcon,
} from "lucide-react"

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

interface PricingManagementProps {
  plans: PricingPlan[]
}

export function PricingManagement({
  plans: initialPlans,
}: PricingManagementProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(initialPlans)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [period, setPeriod] = useState("/ mês")
  const [description, setDescription] = useState("")
  const [badge, setBadge] = useState("")
  const [priceId, setPriceId] = useState("")
  const [featuresInput, setFeaturesInput] = useState("")
  const [highlighted, setHighlighted] = useState(false)
  const [order, setOrder] = useState(0)

  // Stripe direct update options
  const [syncStripe, setSyncStripe] = useState(false)
  const [unitAmount, setUnitAmount] = useState("") // in cents or float
  const [interval, setInterval] = useState<"month" | "year">("month")
  const [intervalCount, setIntervalCount] = useState(1)

  const resetForm = () => {
    setName("")
    setPrice("")
    setPeriod("/ mês")
    setDescription("")
    setBadge("")
    setPriceId("")
    setFeaturesInput("")
    setHighlighted(false)
    setOrder(0)
    setSyncStripe(false)
    setUnitAmount("")
    setInterval("month")
    setIntervalCount(1)
    setEditingId(null)
    setIsCreating(false)
  }

  const handleStartEdit = (plan: PricingPlan) => {
    setEditingId(plan.id)
    setIsCreating(false)
    setName(plan.name)
    setPrice(plan.price)
    setPeriod(plan.period)
    setDescription(plan.description)
    setBadge(plan.badge || "")
    setPriceId(plan.priceId)
    setFeaturesInput(plan.features.join("\n"))
    setHighlighted(plan.highlighted)
    setOrder(plan.order)
    setSyncStripe(false)
  }

  const handleStartCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const features = featuresInput
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean)

      const res = await upsertPricingPlan({
        id: editingId || undefined,
        name,
        price,
        period,
        description,
        badge: badge || null,
        priceId,
        features,
        highlighted,
        order: Number(order),
        createStripePrice: syncStripe,
        unitAmount: unitAmount ? Math.round(Number(unitAmount)) : undefined,
        interval,
        intervalCount: Number(intervalCount),
      })

      if (res.success) {
        toast.success(
          editingId
            ? "Plano atualizado com sucesso!"
            : "Plano criado com sucesso!",
        )
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar plano.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este plano?")) return
    try {
      await deletePricingPlan(id)
      toast.success("Plano removido com sucesso!")
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao remover plano.")
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">
            Gerenciamento de Planos e Preços (LandingC)
          </h3>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={handleStartCreate} className="gap-2">
            <PlusIcon size={16} /> Adicionar Novo Plano
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Configure os cards de preços exibidos na seção de planos da landing
        page. Você pode alterar títulos, valores, badge de destaque (ex: 10% de
        desconto), associar/gerar Price IDs no Stripe e gerenciar as features.
      </p>

      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl border bg-muted/20 p-5"
        >
          <h4 className="text-sm font-semibold">
            {isCreating ? "Criar Novo Plano" : "Editar Plano"}
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-400">
                Nome do Plano
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Semestral"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Preço Exibido
              </label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: R$ 35,91"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Período
              </label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ex: / mês"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-400">
                Badge do Topo (Destaque)
              </label>
              <Input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: 10% de Desconto"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Stripe Price ID
              </label>
              <Input
                value={priceId}
                onChange={(e) => setPriceId(e.target.value)}
                placeholder="Ex: price_1U5yIz..."
                required={!syncStripe}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Ordem (Exibição)
              </label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400">
              Descrição / Rodapé do Preço
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: R$ 215,46 cobrados a cada 6 meses."
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400">
              Features (uma por linha)
            </label>
            <textarea
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Agenda online 24/7&#10;Página própria do estabelecimento&#10;Gestão de equipe"
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="highlighted"
              checked={highlighted}
              onChange={(e) => setHighlighted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="highlighted" className="text-sm font-medium">
              Destacar este card (borda especial / plano principal)
            </label>
          </div>

          {/* Stripe Sync Option */}
          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncStripe"
                checked={syncStripe}
                onChange={(e) => setSyncStripe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="syncStripe"
                className="text-sm font-semibold text-primary"
              >
                Criar/Atualizar novo Preço automaticamente no Stripe
              </label>
            </div>
            {syncStripe && (
              <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    Valor em Centavos (ex: 3591 = R$ 35,91)
                  </label>
                  <Input
                    type="number"
                    value={unitAmount}
                    onChange={(e) => setUnitAmount(e.target.value)}
                    placeholder="3591"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    Intervalo
                  </label>
                  <select
                    value={interval}
                    onChange={(e) =>
                      setInterval(e.target.value as "month" | "year")
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="month">Mês (month)</option>
                    <option value="year">Ano (year)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400">
                    Contagem de Intervalo (ex: 6 meses)
                  </label>
                  <Input
                    type="number"
                    value={intervalCount}
                    onChange={(e) => setIntervalCount(Number(e.target.value))}
                    placeholder="1"
                    min={1}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Plano"}
            </Button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col justify-between space-y-4 rounded-xl border bg-background p-5 ${
              plan.highlighted ? "border-primary shadow-md" : "border-border"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {plan.name}
                </span>
                {plan.badge && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {plan.badge}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{plan.price}</span>
                <span className="text-xs text-muted-foreground">
                  {plan.period}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {plan.description}
              </p>
              <div className="truncate rounded bg-muted p-1 font-mono text-[11px] text-gray-400">
                Stripe ID: {plan.priceId}
              </div>

              <ul className="space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckIcon size={14} className="shrink-0 text-primary" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartEdit(plan)}
                className="gap-1"
              >
                <PencilIcon size={14} /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(plan.id)}
                className="gap-1"
              >
                <TrashIcon size={14} /> Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
