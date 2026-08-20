import Header from "@/app/_components/header"
import Footer from "@/app/_components/footer"
import Link from "next/link"
import Image from "next/image"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { PricingCards } from "./_components/pricing-cards"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "VIZUGO — Gestão e Agendamento para Estabelecimentos",
  description:
    "Agenda, equipe, clientes, financeiro e presença digital em uma experiência criada para estabelecimentos que querem transmitir organização e profissionalismo.",
}

export default async function LandingCPage() {
  const session = await getServerSession(authOptions)
  let barbershopId: string | undefined = undefined

  if (session?.user) {
    const shop = await db.barbershop.findFirst({
      where: { userId: (session.user as any).id },
    })
    if (shop) {
      barbershopId = shop.id
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] font-sans text-zinc-100 selection:bg-amber-400 selection:text-black">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-900 pb-28 pt-24 lg:pb-36 lg:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-[#0a0a0c] to-[#0a0a0c]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content */}
            <div className="space-y-8 lg:col-span-7">
              <div className="inline-flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                <span>Gestão Premium para Estabelecimentos</span>
              </div>

              <h1 className="text-4xl font-light leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Seu atendimento <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text font-semibold text-transparent">
                  começa antes da cadeira.
                </span>
              </h1>

              <p className="max-w-xl text-lg font-normal leading-relaxed text-zinc-400">
                Agenda, equipe, clientes, financeiro e presença digital em uma
                experiência criada para negócios que querem transmitir
                organização e profissionalismo.
              </p>

              <div className="flex flex-col items-stretch gap-4 pt-2 sm:flex-row sm:items-center">
                <Link href="/barbershop-dashboard">
                  <button className="w-full rounded-full bg-amber-400 px-8 py-4 text-center text-sm font-medium tracking-wide text-black shadow-xl shadow-amber-400/10 transition-all hover:bg-amber-300 sm:w-auto">
                    Criar minha barbearia / salão
                  </button>
                </Link>
                <a href="#recursos">
                  <button className="w-full rounded-full border border-zinc-800 bg-transparent px-8 py-4 text-center text-sm font-medium tracking-wide text-zinc-300 transition-all hover:border-zinc-700 hover:text-white sm:w-auto">
                    Conhecer a plataforma
                  </button>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-6 border-t border-zinc-900/80 pt-8 font-mono text-xs text-zinc-400">
                <div>
                  <span className="block text-2xl font-light text-white">
                    24/7
                  </span>
                  <span>agendamento online</span>
                </div>
                <div>
                  <span className="block text-2xl font-light text-white">
                    1 link
                  </span>
                  <span>para divulgar</span>
                </div>
                <div>
                  <span className="block text-2xl font-light text-white">
                    39,90
                  </span>
                  <span>preço acessível</span>
                </div>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="relative lg:col-span-5">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl">
                <Image
                  src="/banner-01.png"
                  alt="Estabelecimento VIZUGO"
                  fill
                  className="object-cover object-center opacity-90 transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8 space-y-2">
                  <div className="font-mono text-xs uppercase tracking-widest text-amber-400">
                    Painel Operacional
                  </div>
                  <div className="text-xl font-medium text-white">
                    Menos improviso. Mais controle do negócio.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="bg-[#0a0a0c] py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-20 max-w-2xl space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-amber-400">
              Tudo no mesmo lugar
            </h2>
            <p className="text-3xl font-light tracking-tight text-white sm:text-5xl">
              O VIZUGO organiza a operação sem deixar o sistema pesado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">01</div>
              <h3 className="text-xl font-medium text-white">
                Agenda inteligente
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Horários disponíveis em tempo real, confirmação de agendamento e
                controle por profissional.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">02</div>
              <h3 className="text-xl font-medium text-white">Página própria</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Divulgue seu link exclusivo para o estabelecimento e receba
                agendamentos a qualquer hora.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">03</div>
              <h3 className="text-xl font-medium text-white">
                Equipe e serviços
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Cadastre profissionais, comissões, serviços, duração e preços em
                uma gestão simples.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">04</div>
              <h3 className="text-xl font-medium text-white">Clientes</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Histórico automático de atendimentos, contato, gasto acumulado e
                base organizada.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">05</div>
              <h3 className="text-xl font-medium text-white">Financeiro</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Receitas, despesas, lucro estimado e acompanhamento mensal do
                desempenho do estabelecimento.
              </p>
            </div>

            <div className="space-y-6 rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8 transition-all hover:border-zinc-800">
              <div className="font-mono text-xs text-amber-400">06</div>
              <h3 className="text-xl font-medium text-white">
                Presença Digital
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Painel web otimizado para computadores e dispositivos móveis com
                total autonomia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Interactive Stripe Checkout Buttons */}
      <section
        id="planos"
        className="border-t border-zinc-900 bg-[#0d0d10] py-28"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-20 max-w-2xl space-y-4 text-center">
            <h2 className="font-mono text-xs uppercase tracking-widest text-amber-400">
              Planos e Assinaturas
            </h2>
            <p className="text-3xl font-light tracking-tight text-white sm:text-5xl">
              Escolha o ciclo ideal para o seu estabelecimento.
            </p>
            <p className="text-sm text-zinc-400">
              Economize mais optando pelos planos semestral ou anual.
            </p>
          </div>

          <PricingCards barbershopId={barbershopId} />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-zinc-900 bg-[#0a0a0c] py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6 px-6">
          <div className="mb-4 flex justify-center">
            <Image
              src="/logo_txt.png"
              alt="VIZUGO"
              width={140}
              height={36}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-light text-white">
            Transforme seu link em uma recepção digital.
          </h2>
          <p className="text-sm text-zinc-400">
            Cadastre o estabelecimento e comece a organizar os horários hoje.
          </p>
          <div className="pt-4">
            <Link href="/barbershop-dashboard">
              <button className="rounded-full bg-amber-400 px-8 py-4 text-sm font-medium text-black shadow-xl shadow-amber-400/10 transition-all hover:bg-amber-300">
                Criar minha conta agora
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
