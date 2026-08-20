"use client"

import { useState } from "react"
import {
  upsertFeaturedPlan,
  deleteFeaturedPlan,
} from "@/app/_actions/admin/manage-featured"
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

interface FeaturedManagementProps {
  plans: FeaturedPlan[]
}

export function FeaturedManagement({
  plans: initialPlans,
}: FeaturedManagementProps) {
  const [plans, setPlans] = useState<FeaturedPlan[]>(initialPlans)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [period, setPeriod] = useState("30 dias")
  const [durationDays, setDurationDays] = useState(30)
  const [description, setDescription] = useState("")
  const [priceId, setPriceId] = useState("")
  const [featuresInput, setFeaturesInput] = useState("")

  // Stripe Sync Option
  const [syncStripe, setSyncStripe] = useState(false)
  const [unitAmount, setUnitAmount] = useState("")

  const resetForm = () => {
    setName("")
    setPrice("")
    setPeriod("30 dias")
    setDurationDays(30)
    setDescription("")
    setPriceId("")
    setFeaturesInput("")
    setSyncStripe(false)
    setUnitAmount("")
    setEditingId(null)
    setIsCreating(false)
  }

  const handleStartEdit = (plan: FeaturedPlan) => {
    setEditingId(plan.id)
    setIsCreating(false)
    setName(plan.name)
    setPrice(plan.price)
    setPeriod(plan.period)
    setDurationDays(plan.durationDays)
    setDescription(plan.description)
    setPriceId(plan.priceId)
    setFeaturesInput(plan.features.join("\n"))
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

      const res = await upsertFeaturedPlan({
        id: editingId || undefined,
        name,
        price,
        period,
        durationDays: Number(durationDays),
        description,
        priceId,
        features,
        createStripePrice: syncStripe,
        unitAmount: unitAmount ? Math.round(Number(unitAmount)) : undefined,
      })

      if (res.success) {
        toast.success(
          editingId
            ? "Pacote de Destaque atualizado!"
            : "Pacote de Destaque criado!",
        )
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar pacote.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este pacote de destaque?"))
      return
    try {
      await deleteFeaturedPlan(id)
      toast.success("Pacote removido com sucesso!")
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao remover pacote.")
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">
            Gerenciamento de Pacotes de Destaque (Pagamento Único / Stripe)
          </h3>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={handleStartCreate} className="gap-2">
            <PlusIcon size={16} /> Adicionar Pacote de Destaque
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Configure os pacotes que os estabelecimentos podem comprar para
        impulsionar e destacar seus perfis na home e nas buscas por um período
        determinado.
      </p>

      {(isCreating || editingId) && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl border bg-muted/20 p-5"
        >
          <h4 className="text-sm font-semibold">
            {isCreating
              ? "Criar Pacote de Destaque"
              : "Editar Pacote de Destaque"}
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-400">
                Nome do Pacote
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Destaque por 30 dias"
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
                placeholder="Ex: R$ 49,90"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Duração em Dias
              </label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                placeholder="30"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-gray-400">
                Período Descritivo
              </label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ex: 30 dias"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">
                Stripe Price ID (Pagamento Único)
              </label>
              <Input
                value={priceId}
                onChange={(e) => setPriceId(e.target.value)}
                placeholder="Ex: price_1U5yIz..."
                required={!syncStripe}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400">
              Descrição
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Apareça no topo da página inicial e receba mais agendamentos."
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
              placeholder="Prioridade máxima na busca&#10;Selo de Destaque na Home"
              rows={3}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Stripe Sync Option */}
          <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="syncFeaturedStripe"
                checked={syncStripe}
                onChange={(e) => setSyncStripe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="syncFeaturedStripe"
                className="text-sm font-semibold text-primary"
              >
                Criar/Atualizar Preço Único automaticamente no Stripe
              </label>
            </div>
            {syncStripe && (
              <div>
                <label className="text-xs font-medium text-gray-400">
                  Valor em Centavos (ex: 4990 = R$ 49,90)
                </label>
                <Input
                  type="number"
                  value={unitAmount}
                  onChange={(e) => setUnitAmount(e.target.value)}
                  placeholder="4990"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Pacote"}
            </Button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col justify-between space-y-4 rounded-xl border border-border bg-background p-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-muted-foreground">
                  {plan.name}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {plan.durationDays} dias de destaque
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
