"use client"

import { Button } from "./ui/button"
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon } from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"

const SidebarSheet = () => {
  const { data } = useSession()
  const handleLogoutClick = () => signOut()

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        {data?.user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={data?.user?.image ?? ""} />
            </Avatar>

            <div>
              <p className="font-bold">{data.user.name}</p>
              <p className="text-xs">{data.user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <p className="text-sm font-bold">
              <SheetClose asChild>
                <Link href="/signup" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </SheetClose>{" "}
              ou faça login
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full gap-2">
                  <LogInIcon size={16} />
                  Fazer Login
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>
        <Button className="justify-start gap-2" variant="ghost" asChild>
          <Link href="/bookings">
            <CalendarIcon size={18} />
            Agendamentos
          </Link>
        </Button>
        {!data?.user && (
          <SheetClose asChild>
            <Button
              className="justify-start gap-2 font-bold text-primary"
              variant="ghost"
              asChild
            >
              <Link href="/signup">Cadastre-se</Link>
            </Button>
          </SheetClose>
        )}
        {data?.user && (
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/profile">
              <LogInIcon size={18} />
              Meu Perfil
            </Link>
          </Button>
        )}
        {data?.user && (data?.user as any)?.role === "BARBERSHOP" && (
          <Button
            className="justify-start gap-2 text-primary"
            variant="ghost"
            asChild
          >
            <Link href="/barbershop-dashboard">
              <LogInIcon size={18} />
              Painel da Barbearia
            </Link>
          </Button>
        )}
        {data?.user && (data?.user as any)?.role === "ADMIN" && (
          <SheetClose asChild>
            <Button
              className="justify-start gap-2 font-bold text-primary"
              variant="ghost"
              asChild
            >
              <Link href="/admin">
                <LogInIcon size={18} />
                Gerenciar VizuGo
              </Link>
            </Button>
          </SheetClose>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-solid py-5">
        {quickSearchOptions.map((option) => (
          <SheetClose key={option.title} asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href={`/barbershops?service=${option.title}`}>
                <Image
                  alt={option.title}
                  src={option.imageUrl}
                  height={18}
                  width={18}
                />
                {option.title}
              </Link>
            </Button>
          </SheetClose>
        ))}
      </div>

      {data?.user && (
        <div className="flex flex-col gap-2 py-5">
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={handleLogoutClick}
          >
            <LogOutIcon size={18} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
