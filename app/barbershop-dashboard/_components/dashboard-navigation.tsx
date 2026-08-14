"use client"

import { useEffect, useState } from "react"
import { Button } from "@/app/_components/ui/button"
import {
  ArrowUpIcon,
  LayoutDashboardIcon,
  ScissorsIcon,
  UsersIcon,
  BarChart3Icon,
  CalendarDaysIcon,
  PlusCircleIcon,
} from "lucide-react"

export const DashboardNavigation = () => {
  const [showTopButton, setShowTopButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopButton(true)
      } else {
        setShowTopButton(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Menu Flutuante Responsivo */}
      <div className="sticky top-4 z-40 mb-6 w-full overflow-x-auto rounded-2xl border bg-background/90 p-2.5 shadow-xl backdrop-blur-md [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-2 px-1">
          <div className="flex shrink-0 items-center gap-1.5 border-r border-border pr-3 text-xs font-bold uppercase text-gray-400">
            <LayoutDashboardIcon size={16} className="text-primary" />
            <span>Navegação:</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => scrollToSection("section-cadastrar-barbershop")}
            >
              <PlusCircleIcon size={14} /> Nova Barbearia
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => scrollToSection("section-profissionais")}
            >
              <UsersIcon size={14} /> Profissionais
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => scrollToSection("section-servicos")}
            >
              <ScissorsIcon size={14} /> Serviços
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => scrollToSection("section-metricas")}
            >
              <BarChart3Icon size={14} /> Métricas
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 gap-1.5 text-xs font-semibold"
              onClick={() => scrollToSection("section-agendamentos")}
            >
              <CalendarDaysIcon size={14} /> Agendamentos
            </Button>
          </div>
        </div>
      </div>

      {/* Botão Flutuante Voltar ao Topo */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
          title="Voltar ao Topo"
          aria-label="Voltar ao Topo"
        >
          <ArrowUpIcon size={20} />
        </button>
      )}
    </>
  )
}
