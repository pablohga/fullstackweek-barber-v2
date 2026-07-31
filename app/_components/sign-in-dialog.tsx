"use client"

import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import Image from "next/image"
import { useState } from "react"
import { Input } from "./ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SignInDialog = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLoginWithGoogleClick = () => signIn("google")

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Preencha todos os campos.")
      return
    }

    try {
      setLoading(true)
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error("E-mail ou senha inválidos.")
      } else {
        toast.success("Login realizado com sucesso!")
        router.refresh()
      }
    } catch (error) {
      toast.error("Erro ao fazer login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta ou Google.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleCredentialsLogin} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-400">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
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
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar com E-mail"}
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
        onClick={handleLoginWithGoogleClick}
      >
        <Image
          alt="Fazer login com o Google"
          src="/google.svg"
          width={18}
          height={18}
        />
        Google
      </Button>

      <div className="pt-2 text-center">
        <p className="text-xs text-gray-400">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="font-bold text-primary hover:underline"
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignInDialog
