"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createBarbershopAccount } from "@/app/_actions/admin/create-barbershop-account"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog"

const CreateBarbershopModal = () => {
  const [open, setOpen] = useState(false)
  const [barbershopName, setBarbershopName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [address, setAddress] = useState("")
  const [complement, setComplement] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [billingPeriod, setBillingPeriod] = useState("Mensal")
  const [billingAmount, setBillingAmount] = useState("39,00")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBillingChange = (period: string, amount: string) => {
    setBillingPeriod(period)
    setBillingAmount(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !barbershopName ||
      !ownerName ||
      !address ||
      !state ||
      !city ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }

    try {
      setLoading(true)
      await createBarbershopAccount({
        barbershopName,
        ownerName,
        address,
        complement,
        state,
        city,
        phone,
        whatsapp,
        email,
        password,
        confirmPassword,
        billingPeriod,
        billingAmount,
      })
      toast.success("Conta de Barbearia criada com sucesso!")
      setBarbershopName("")
      setOwnerName("")
      setAddress("")
      setComplement("")
      setState("")
      setCity("")
      setPhone("")
      setWhatsapp("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setBillingPeriod("Mensal")
      setBillingAmount("39,00")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta de barbearia.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmitirCobranca = () => {
    toast.info("Função Emitir cobrança será implementada futuramente.")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Adicionar Nova Barbearia</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Barbearia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-400">
            Cadastre uma nova barbearia e defina as informações de acesso e
            cobrança.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Nome da Barbearia
              </label>
              <Input
                value={barbershopName}
                onChange={(e) => setBarbershopName(e.target.value)}
                placeholder="Ex: Barbearia Central"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Nome do Responsável
              </label>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-gray-400">
                Endereço
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua Principal, 123"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Complemento
              </label>
              <Input
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Ex: Sala 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Cidade
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Estado
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ex: SP"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Telefone
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Telefone (WhatsApp)
              </label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barbearia@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Senha
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Confirmação de Senha
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-400">
              Período de Cobrança
            </label>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-6 sm:space-y-0">
              <label className="flex cursor-pointer items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={billingPeriod === "Mensal"}
                  onChange={() => handleBillingChange("Mensal", "39,00")}
                  className="rounded border-input"
                />
                <span>Mensal (R$ 39,00)</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={billingPeriod === "Semestral"}
                  onChange={() => handleBillingChange("Semestral", "240,00")}
                  className="rounded border-input"
                />
                <span>Semestral (R$ 240,00)</span>
              </label>
              <label className="flex cursor-pointer items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={billingPeriod === "Anual"}
                  onChange={() => handleBillingChange("Anual", "468,00")}
                  className="rounded border-input"
                />
                <span>Anual (R$ 468,00)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleEmitirCobranca}
            >
              Emitir cobrança
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Barbearia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBarbershopModal
