import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { redirect } from "next/navigation"
import ServiceForm from "./_components/service-form"
import ProfessionalForm from "./_components/professional-form"
import ProfessionalsManagement from "./_components/professionals-management"
import BookingsManagement from "./_components/bookings-management"
import EditBarbershopModal from "./_components/edit-barbershop-modal"
import { MetricsDashboard } from "./_components/metrics-dashboard"
import { DashboardNavigation } from "./_components/dashboard-navigation"
import { RenewalBanner } from "./_components/renewal-banner"
import { getPricingPlans } from "@/app/_actions/admin/manage-pricing"
import { getFeaturedPlans } from "@/app/_actions/admin/manage-featured"
import { FeaturedPlansSection } from "./_components/featured-plans-section"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Painel do Estabelecimento",
}

const BarbershopDashboardPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    redirect("/")
  }

  const [barbershops, pricingPlans, featuredPlans] = await Promise.all([
    db.barbershop.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        services: {
          include: {
            bookings: {
              include: {
                user: true,
                service: true,
                professional: true,
              },
            },
          },
        },
        professionals: true,
      },
    }),
    getPricingPlans(),
    getFeaturedPlans(),
  ])

  const serializedFeaturedPlans = featuredPlans.map((plan) => ({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }))

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-5xl space-y-8 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel do Estabelecimento</h1>
        </div>

        {/* Gerenciar Estabelecimentos, Serviços e Agendamentos */}
        <div className="space-y-6">
          {barbershops.length === 0 ? (
            <p className="text-gray-400">
              Você ainda não possui nenhum estabelecimento ativo.
            </p>
          ) : (
            barbershops.map((barbershop) => {
              const now = new Date()
              const endsAt = barbershop.subscriptionEndsAt
                ? new Date(barbershop.subscriptionEndsAt)
                : null
              const daysRemaining = endsAt
                ? Math.ceil(
                    (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                  )
                : null

              const isActive =
                barbershop.subscriptionStatus === "active" ||
                barbershop.subscriptionStatus === "trialing"
              const isExpired = endsAt ? endsAt < now : true
              const isDelinquent =
                !isActive ||
                isExpired ||
                barbershop.subscriptionStatus === "canceled" ||
                barbershop.subscriptionStatus === "past_due" ||
                barbershop.subscriptionStatus === "unpaid" ||
                barbershop.subscriptionStatus === "inactive"

              return (
                <div key={barbershop.id} className="space-y-6">
                  {/* Banner de Notificação de Renovação ou Bloqueio */}
                  <RenewalBanner
                    barbershopId={barbershop.id}
                    daysRemaining={daysRemaining}
                    isDelinquent={isDelinquent}
                    plans={JSON.parse(JSON.stringify(pricingPlans))}
                  />

                  {/* Menu de Navegação Flutuante (Apenas se não estiver inadimplente) */}
                  {!isDelinquent && <DashboardNavigation />}

                  <div
                    className={`space-y-6 rounded-xl border border-solid bg-card p-6 ${
                      isDelinquent ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <img
                          src={barbershop.imageUrl}
                          alt={barbershop.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-bold">
                            {barbershop.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {barbershop.address}
                          </p>
                        </div>
                      </div>
                      {!isDelinquent && (
                        <EditBarbershopModal
                          barbershop={JSON.parse(JSON.stringify(barbershop))}
                        />
                      )}
                    </div>

                    {isDelinquent ? (
                      <div className="py-12 text-center font-medium text-red-400">
                        Recursos bloqueados devido à inadimplência. Conclua a
                        renovação acima para desbloquear o painel.
                      </div>
                    ) : (
                      <>
                        {/* Cadastrar Profissional */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold uppercase text-gray-400">
                            Cadastrar Profissionais
                          </h4>
                          <ProfessionalForm barbershopId={barbershop.id} />
                        </div>

                        {/* Lista de Profissionais */}
                        <div id="section-profissionais" className="space-y-2">
                          <h4 className="text-sm font-semibold uppercase text-gray-400">
                            Profissionais Cadastrados
                          </h4>
                          <ProfessionalsManagement
                            professionals={JSON.parse(
                              JSON.stringify(barbershop.professionals),
                            )}
                          />
                        </div>

                        {/* Cadastrar Serviço */}
                        <div className="space-y-3 border-t pt-4">
                          <h4 className="text-sm font-semibold uppercase text-gray-400">
                            Cadastrar e Precificar Serviços
                          </h4>
                          <ServiceForm barbershopId={barbershop.id} />
                        </div>

                        {/* Lista de Serviços */}
                        <div id="section-servicos" className="space-y-2">
                          <h4 className="text-sm font-semibold uppercase text-gray-400">
                            Serviços Cadastrados
                          </h4>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {barbershop.services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <p className="font-bold">{service.name}</p>
                                  <p className="text-xs text-gray-400">
                                    {service.description}
                                  </p>
                                </div>
                                <p className="font-bold text-primary">
                                  {Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(Number(service.price))}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Seção de Impulsionamento e Destaque */}
                        <div id="section-destaque" className="border-t pt-4">
                          <FeaturedPlansSection
                            barbershopId={barbershop.id}
                            featuredUntil={
                              barbershop.featuredUntil
                                ? barbershop.featuredUntil.toISOString()
                                : null
                            }
                            plans={serializedFeaturedPlans}
                          />
                        </div>

                        {/* Métricas do Negócio */}
                        <div
                          id="section-metricas"
                          className="space-y-3 border-t pt-4"
                        >
                          <MetricsDashboard barbershopId={barbershop.id} />
                        </div>

                        {/* Gerenciamento de Agendamentos */}
                        <div
                          id="section-agendamentos"
                          className="space-y-3 border-t pt-4"
                        >
                          <BookingsManagement
                            barbershop={JSON.parse(JSON.stringify(barbershop))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default BarbershopDashboardPage
