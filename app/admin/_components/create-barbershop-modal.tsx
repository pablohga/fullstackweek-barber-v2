"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createBarbershopAccount } from "@/app/_actions/admin/create-barbershop-account"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const CreateBarbershopModal = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos.")
      return
    }

    try {
      setLoading(true)
      await createBarbershopAccount({ name, email, password })
      toast.success("Conta de Barbearia criada com sucesso!")
      setName("")
      setEmail("")
      setPassword("")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta de barbearia.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-5">
      <h3 className="text-lg font-bold">Cadastrar Conta de Barbearia</h3>
      <p className="text-xs text-gray-400">
        Apenas o Administrador pode cadastrar novas contas do tipo Barbearia.
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-gray-400">
            Nome da Barbearia / Dono
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Barbearia Central"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="barbearia@email.com"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400">Senha</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar Barbearia"}
      </Button>
    </form>
  )
}

export default CreateBarbershopModal
