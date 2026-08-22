"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { registerUser } from "@/app/_actions/register-user"
import { registerBarbershopSignup } from "@/app/_actions/register-barbershop-signup"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { CheckIcon, Loader2Icon, StoreIcon, UserIcon } from "lucide-react"

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

interface SignupClientProps {
  plans: PricingPlan[]
}

const ESTABLISHMENT_TYPES = [
  "Barbearias",
  "Cabelo",
  "Unhas",
  "Sobrancelhas & Cílios",
  "Maquiagem",
  "Tatuagem & Piercing",
]

export default function SignupClient({ plans }: SignupClientProps) {
  const [activeTab, setActiveTab] = useState<"client" | "barbershop">("client")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Client Form State
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientWhatsapp, setClientWhatsapp] = useState("")
  const [clientAddress, setClientAddress] = useState("")
  const [clientPassword, setClientPassword] = useState("")
  const [clientPasswordConfirmation, setClientPasswordConfirmation] =
    useState("")

  // Barbershop Form State
  const [barbershopName, setBarbershopName] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [ownerName, setOwnerName] = useState("")
  const [barbershopEmail, setBarbershopEmail] = useState("")
  const [barbershopPhone, setBarbershopPhone] = useState("")
  const [barbershopWhatsapp, setBarbershopWhatsapp] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [barbershopPassword, setBarbershopPassword] = useState("")
  const [barbershopConfirmPassword, setBarbershopConfirmPassword] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [selectedPriceId, setSelectedPriceId] = useState<string>(
    plans[0]?.priceId || "",
  )

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !clientPassword ||
      !clientPasswordConfirmation
    ) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    if (clientPassword !== clientPasswordConfirmation) {
      toast.error("As senhas não coincidem.")
      return
    }

    try {
      setLoading(true)
      await registerUser({
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        whatsapp: clientWhatsapp,
        address: clientAddress,
        password: clientPassword,
        passwordConfirmation: clientPasswordConfirmation,
      })
      toast.success("Conta de cliente criada com sucesso!")

      await signIn("credentials", {
        email: clientEmail,
        password: clientPassword,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar cliente.")
    } finally {
      setLoading(false)
    }
  }

  const handleBarbershopRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !barbershopName ||
      !ownerName ||
      !barbershopEmail ||
      !barbershopPhone ||
      !address ||
      !city ||
      !state ||
      !barbershopPassword ||
      !barbershopConfirmPassword
    ) {
      toast.error("Preencha todos os campos obrigatórios do estabelecimento.")
      return
    }

    if (selectedTypes.length === 0) {
      toast.error("Selecione pelo menos um tipo de estabelecimento.")
      return
    }

    if (barbershopPassword !== barbershopConfirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }

    if (!selectedPriceId) {
      toast.error("Selecione um plano de assinatura.")
      return
    }

    try {
      setLoading(true)
      const res = await registerBarbershopSignup({
        barbershopName,
        types: selectedTypes,
        ownerName,
        email: barbershopEmail,
        phone: barbershopPhone,
        whatsapp: barbershopWhatsapp,
        address,
        city,
        state,
        password: barbershopPassword,
        confirmPassword: barbershopConfirmPassword,
        imageUrl,
      })

      toast.success(
        "Estabelecimento cadastrado com sucesso! Redirecionando para pagamento...",
      )

      // Sign in automatically
      await signIn("credentials", {
        email: barbershopEmail,
        password: barbershopPassword,
        redirect: false,
      })

      // Trigger Stripe Checkout
      const checkoutRes = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId: res.barbershopId,
          priceId: selectedPriceId,
        }),
      })

      const checkoutData = await checkoutRes.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        toast.error(
          checkoutData.error ||
            "Erro ao iniciar pagamento. Redirecionando para o painel.",
        )
        router.push("/barbershop-dashboard")
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar estabelecimento.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => signIn("google")

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Crie sua conta no <span className="text-amber-400">VizUAU</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Escolha o perfil ideal para começar a usar nossa plataforma.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="mx-auto flex max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("client")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
            activeTab === "client"
              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <UserIcon size={18} />
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("barbershop")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
            activeTab === "barbershop"
              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <StoreIcon size={18} />
          Estabelecimento / Profissional
        </button>
      </div>

      {activeTab === "client" ? (
        <div className="mx-auto max-w-lg space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-white">
              Cadastro de Cliente
            </h2>
            <p className="text-xs text-zinc-400">
              Encontre serviços de beleza, agende horários e avalie
              estabelecimentos.
            </p>
          </div>

          <form onSubmit={handleClientRegister} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">
                Nome Completo *
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Seu Nome"
                required
                className="border-zinc-800 bg-zinc-900 text-white"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  E-mail *
                </label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Telefone *
                </label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  WhatsApp
                </label>
                <Input
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Endereço
                </label>
                <Input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro"
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Senha *
                </label>
                <Input
                  type="password"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  placeholder="******"
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400">
                  Confirmar Senha *
                </label>
                <Input
                  type="password"
                  value={clientPasswordConfirmation}
                  onChange={(e) =>
                    setClientPasswordConfirmation(e.target.value)
                  }
                  placeholder="******"
                  required
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-black hover:bg-amber-300"
              disabled={loading}
            >
              {loading ? (
                <Loader2Icon className="animate-spin" size={18} />
              ) : (
                "Cadastrar Conta"
              )}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="mx-4 flex-shrink text-xs uppercase text-zinc-500">
              ou
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl border-zinc-800 bg-zinc-900 py-3 text-white hover:bg-zinc-800"
            onClick={handleGoogleSignup}
          >
            <Image alt="Google" src="/google.svg" width={18} height={18} />
            Continuar com Google
          </Button>

          <div className="pt-2 text-center">
            <p className="text-xs text-zinc-400">
              Já tem uma conta?{" "}
              <Link
                href="/"
                className="font-bold text-amber-400 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-bold text-white">
              Cadastro de Estabelecimento
            </h2>
            <p className="text-sm text-zinc-400">
              Gerencie seus profissionais, agenda, serviços e turbine seu
              negócio com o VizUAU.
            </p>
          </div>

          <form onSubmit={handleBarbershopRegister} className="space-y-6">
            <div className="space-y-4">
              <h3 className="border-b border-zinc-800 pb-2 font-mono text-sm uppercase tracking-wider text-amber-400">
                1. Informações do Estabelecimento
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Nome do Estabelecimento *
                  </label>
                  <Input
                    value={barbershopName}
                    onChange={(e) => setBarbershopName(e.target.value)}
                    placeholder="Ex: Studio VizUAU Prime"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Nome do Responsável / Proprietário *
                  </label>
                  <Input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
              </div>

              {/* Establishment Types */}
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Tipos de Estabelecimento (Selecione os que se aplicam) *
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {ESTABLISHMENT_TYPES.map((type) => {
                    const isSelected = selectedTypes.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTypeToggle(type)}
                        className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-amber-400 bg-amber-400/10 text-amber-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
                        }`}
                      >
                        <span>{type}</span>
                        {isSelected && (
                          <CheckIcon size={14} className="text-amber-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    E-mail *
                  </label>
                  <Input
                    type="email"
                    value={barbershopEmail}
                    onChange={(e) => setBarbershopEmail(e.target.value)}
                    placeholder="contato@estabelecimento.com"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Telefone *
                  </label>
                  <Input
                    value={barbershopPhone}
                    onChange={(e) => setBarbershopPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    WhatsApp
                  </label>
                  <Input
                    value={barbershopWhatsapp}
                    onChange={(e) => setBarbershopWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="text-xs font-medium text-zinc-400">
                    Endereço (Rua e Número) *
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Av. Paulista, 1000"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Cidade *
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Estado *
                  </label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="SP"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400">
                  URL da Imagem / Logo (Opcional)
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.jpg"
                  className="border-zinc-800 bg-zinc-900 text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Senha de Acesso *
                  </label>
                  <Input
                    type="password"
                    value={barbershopPassword}
                    onChange={(e) => setBarbershopPassword(e.target.value)}
                    placeholder="******"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">
                    Confirmar Senha *
                  </label>
                  <Input
                    type="password"
                    value={barbershopConfirmPassword}
                    onChange={(e) =>
                      setBarbershopConfirmPassword(e.target.value)
                    }
                    placeholder="******"
                    required
                    className="border-zinc-800 bg-zinc-900 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Selection */}
            <div className="space-y-4 border-t border-zinc-800 pt-4">
              <h3 className="font-mono text-sm uppercase tracking-wider text-amber-400">
                2. Escolha o Plano de Assinatura
              </h3>
              <p className="text-xs text-zinc-400">
                Selecione abaixo o plano ideal para o seu estabelecimento. O
                pagamento será processado via Stripe com confirmação instantânea
                para liberação imediata.
              </p>

              <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
                {plans.map((plan) => {
                  const isSelected = selectedPriceId === plan.priceId
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPriceId(plan.priceId)}
                      className={`relative flex cursor-pointer flex-col justify-between space-y-6 rounded-2xl border p-6 transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/5 shadow-xl ring-2 ring-amber-400"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 font-mono text-[10px] font-semibold uppercase text-black">
                          {plan.badge}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase text-amber-400">
                            {plan.name}
                          </span>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                              isSelected
                                ? "border-amber-400 bg-amber-400"
                                : "border-zinc-700"
                            }`}
                          >
                            {isSelected && (
                              <CheckIcon size={12} className="text-black" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-light text-white">
                            {plan.price}
                          </span>
                          <span className="font-mono text-xs text-zinc-500">
                            {plan.period}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          {plan.description}
                        </p>
                      </div>

                      <ul className="space-y-2 border-t border-zinc-800 pt-4 text-xs font-light text-zinc-300">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckIcon
                              size={14}
                              className="flex-shrink-0 text-amber-400"
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-amber-400 py-4 text-base font-bold text-black shadow-lg shadow-amber-400/20 hover:bg-amber-300"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="animate-spin" size={18} /> Processando
                  cadastro e pagamento...
                </span>
              ) : (
                "Concluir e Ir para Pagamento"
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
