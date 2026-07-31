import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { redirect } from "next/navigation"
import BarbershopForm from "./_components/barbershop-form"
import ServiceForm from "./_components/service-form"
import BookingsManagement from "./_components/bookings-management"

const BarbershopDashboardPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "BARBERSHOP") {
    redirect("/")
  }

  const barbershops = await db.barbershop.findMany({
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
            },
          },
        },
      },
    },
  })

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-5xl space-y-8 p-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel da Barbearia</h1>
        </div>

        {/* Cadastrar Barbearia */}
        <div className="space-y-4 rounded-xl border border-solid p-6">
          <h2 className="text-lg font-bold">1. Cadastrar Nova Barbearia</h2>
          <BarbershopForm />
        </div>

        {/* Gerenciar Barbearias, Serviços e Agendamentos */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold">
            2. Suas Barbearias, Serviços e Agendamentos
          </h2>
          {barbershops.length === 0 ? (
            <p className="text-gray-400">
              Você ainda não cadastrou nenhuma barbearia.
            </p>
          ) : (
            barbershops.map((barbershop) => (
              <div
                key={barbershop.id}
                className="space-y-6 rounded-xl border border-solid bg-card p-6"
              >
                <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src={barbershop.imageUrl}
                      alt={barbershop.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-bold">{barbershop.name}</h3>
                      <p className="text-sm text-gray-400">
                        {barbershop.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cadastrar Serviço */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase text-gray-400">
                    Cadastrar e Precificar Serviços
                  </h4>
                  <ServiceForm barbershopId={barbershop.id} />
                </div>

                {/* Lista de Serviços */}
                <div className="space-y-2">
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

                {/* Gerenciamento de Agendamentos */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="text-sm font-semibold uppercase text-gray-400">
                    Gerenciar Agendamentos
                  </h4>
                  <BookingsManagement
                    barbershop={JSON.parse(JSON.stringify(barbershop))}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BarbershopDashboardPage
