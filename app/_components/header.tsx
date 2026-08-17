"use client"

import Image from "next/image"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { MenuIcon, LogInIcon } from "lucide-react"
import { Sheet, SheetTrigger } from "./ui/sheet"
import SidebarSheet from "./sidebar-sheet"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import SignInDialog from "./sign-in-dialog"
import { Avatar, AvatarImage } from "./ui/avatar"

const Header = () => {
  const { data: session } = useSession()

  return (
    <Card className="rounded-none border-x-0 border-t-0">
      <CardContent className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between p-5">
        <Link href="/">
          <Image alt="VizuGo" src="/logo.png" height={18} width={120} />
        </Link>

        {/* Desktop Navbar (hidden on mobile, flex on md+) */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold transition-colors hover:text-primary"
          >
            Início
          </Link>
          <Link
            href="/bookings"
            className="text-sm font-semibold transition-colors hover:text-primary"
          >
            Agendamentos
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-4 border-l border-border pl-6">
              <Link
                href="/profile"
                className="flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image ?? ""} />
                </Avatar>
                <span className="text-sm font-bold">{session.user.name}</span>
              </Link>

              {(session.user as any).role === "BARBERSHOP" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/barbershop-dashboard">Painel da Barbearia</Link>
                </Button>
              )}

              {(session.user as any).role === "ADMIN" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => signOut()}
              >
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="font-semibold"
              >
                <Link href="/signup">Cadastre-se</Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2 font-semibold">
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

        {/* Mobile Hamburger (flex on mobile, hidden on md+) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SidebarSheet />
          </Sheet>
        </div>
      </CardContent>
    </Card>
  )
}

export default Header
