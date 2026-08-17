"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Header from "../_components/header"
import { Button } from "../_components/ui/button"
import { Input } from "../_components/ui/input"
import { registerUser } from "../_actions/register-user"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

const SignUpPage = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !phone || !password || !passwordConfirmation) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    if (password !== passwordConfirmation) {
      toast.error("As senhas não coincidem.")
      return
    }

    try {
      setLoading(true)
      await registerUser({
        name,
        email,
        phone,
        whatsapp,
        address,
        password,
        passwordConfirmation,
      })
      toast.success("Conta cadastrada com sucesso! Faça login para continuar.")

      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar usuário.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => signIn("google")

  return (
    <div>
      <Header />
      <div className="mx-auto my-10 max-w-lg space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Criar Conta de Cliente</h1>
          <p className="text-sm text-gray-400">
            Cadastre-se para pesquisar estabelecimentos, agendar serviços e
            qualificar.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400">
              Nome Completo *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu Nome"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                E-mail *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Telefone de Contato *
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Número WhatsApp
              </label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Endereço
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, Número, Bairro"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-400">
                Senha *
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
                Confirmar Senha *
              </label>
              <Input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="******"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Conta"}
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-muted"></div>
          <span className="mx-4 flex-shrink text-xs uppercase text-muted-foreground">
            ou
          </span>
          <div className="flex-grow border-t border-muted"></div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 font-bold"
          onClick={handleGoogleSignup}
        >
          <Image
            alt="Cadastrar com Google"
            src="/google.svg"
            width={18}
            height={18}
          />
          Continuar com Google
        </Button>

        <div className="pt-2 text-center">
          <p className="text-xs text-gray-400">
            Já tem uma conta?{" "}
            <Link href="/" className="font-bold text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
