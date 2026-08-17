import Header from "../_components/header"
import Image from "next/image"
import { db } from "../_lib/prisma"
import BarbershopItem from "../_components/barbershop-item"
import { quickSearchOptions } from "../_constants/search"
import BookingItem from "../_components/booking-item"
import Search from "../_components/search"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { sortBarbershops } from "../_helpers/sort-barbershops"
import { getBanners } from "../_actions/admin/manage-banners"
import { BannerCarousel } from "./_components/banner-carousel"
import {
  ShieldCheckIcon,
  ZapIcon,
  SparklesIcon,
  StarIcon,
  ArrowRightIcon,
} from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Início (Landing B)",
}

const LandingBPage = async () => {
  const session = await getServerSession(authOptions)
  const rawBarbershops = await db.barbershop.findMany({})
  const barbershops = sortBarbershops(rawBarbershops)
  const confirmedBookings = await getConfirmedBookings()
  const banners = await getBanners()

  const verifiedBarbershops = barbershops.filter(
    (b) => "isVerified" in b && Boolean((b as any).isVerified),
  )
  const featuredBarbershops = barbershops.filter(
    (b) => b.featuredUntil && new Date(b.featuredUntil) > new Date(),
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero Section (Marketplace Style: Amazon + Mercado Livre) */}
        <section className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-12 lg:col-span-12">
              {/* Barra de Busca Prominente */}
              <div className="w-full">
                <Search />
              </div>

              {/* Trust Badges (Mercado Livre Style) */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheckIcon size={16} className="text-green-500" />
                  <span>Barbearias Verificadas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ZapIcon size={16} className="text-yellow-500" />
                  <span>Agendamento Instantâneo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StarIcon size={16} className="fill-primary text-primary" />
                  <span>Avaliações Reais 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Carrossel de Banners */}
        <section>
          <BannerCarousel banners={banners} />
        </section>

        {/* Busca Rápida / Categorias (Mercado Livre / OLX Style) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Navegue por Categoria</h2>
            <Link
              href="/barbershops"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver todas <ArrowRightIcon size={14} />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {quickSearchOptions.map((option) => (
              <Link
                key={option.title}
                href={`/barbershops?service=${option.title}`}
                className="group flex w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-lg sm:w-32"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/20">
                  <Image
                    src={option.imageUrl}
                    width={24}
                    height={24}
                    alt={option.title}
                    className="object-contain"
                  />
                </div>
                <span className="w-full truncate text-xs font-semibold">
                  {option.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Agendamentos Ativos do Usuário */}
        {confirmedBookings.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Seus Próximos Agendamentos</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
              {confirmedBookings.map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={JSON.parse(JSON.stringify(booking))}
                />
              ))}
            </div>
          </section>
        )}

        {/* Destaques do Marketplace (Featured) */}
        {featuredBarbershops.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <SparklesIcon size={18} className="text-primary" /> Barbearias
                em Destaque
              </h2>
              <span className="text-xs text-gray-400">
                Patrocinados e Exclusivos
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredBarbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          </section>
        )}

        {/* Barbearias Verificadas (Amazon / Mercado Livre Verified Badge style) */}
        {verifiedBarbershops.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheckIcon size={18} className="text-green-500" /> Selo de
                Qualidade Verificado
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {verifiedBarbershops.map((barbershop) => (
                <BarbershopItem key={barbershop.id} barbershop={barbershop} />
              ))}
            </div>
          </section>
        )}

        {/* Recomendados / Populares */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Recomendados para Você</h2>
            <Link
              href="/barbershops"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Ver mais <ArrowRightIcon size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {barbershops.map((barbershop) => (
              <BarbershopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingBPage
