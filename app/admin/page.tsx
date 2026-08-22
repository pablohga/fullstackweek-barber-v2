import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { redirect } from "next/navigation"
import CreateBarbershopModal from "./_components/create-barbershop-modal"
import UsersManagement from "./_components/users-management"
import { getBanners } from "@/app/_actions/admin/manage-banners"
import { BannersManagement } from "./_components/banners-management"
import { getPricingPlans } from "@/app/_actions/admin/manage-pricing"
import { PricingManagement } from "./_components/pricing-management"
import { getFeaturedPlans } from "@/app/_actions/admin/manage-featured"
import { FeaturedManagement } from "./_components/featured-management"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Painel do Administrador",
}

const AdminDashboardPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/")
  }

  const dbUser = await db.user.findUnique({
    where: { email: session.user.email },
  })

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/")
  }

  const [users, banners, pricingPlans, featuredPlans] = await Promise.all([
    db.user.findMany({
      include: {
        bookings: {
          include: {
            service: true,
          },
        },
        reviews: true,
        barbershops: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    getBanners(),
    getPricingPlans(),
    getFeaturedPlans(),
  ])

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    bookings: user.bookings.map((booking: any) => ({
      ...booking,
      date: booking.date.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      service: booking.service
        ? {
            ...booking.service,
            price: Number(booking.service.price),
          }
        : null,
    })),
    reviews: user.reviews.map((review: any) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    })),
    barbershops: user.barbershops.map((bs: any) => ({
      ...bs,
      subscriptionEndsAt: bs.subscriptionEndsAt
        ? bs.subscriptionEndsAt.toISOString()
        : null,
      createdAt: bs.createdAt.toISOString(),
      updatedAt: bs.updatedAt.toISOString(),
    })),
  }))

  const barbershopUsers = serializedUsers.filter((u) => u.role === "BARBERSHOP")

  const serializedPricingPlans = pricingPlans.map((plan) => ({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }))

  const serializedFeaturedPlans = featuredPlans.map((plan) => ({
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  }))

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-6xl space-y-8 p-5">
        <h1 className="text-2xl font-bold">Dashboard do Administrador</h1>

        {/* Cadastrar Conta de Estabelecimento */}
        <CreateBarbershopModal barbershopUsers={barbershopUsers} />

        {/* Gerenciamento de Banners da Home */}
        <BannersManagement banners={banners} />

        {/* Gerenciamento de Planos e Preços */}
        <PricingManagement plans={serializedPricingPlans} />

        {/* Gerenciamento de Pacotes de Destaque */}
        <FeaturedManagement plans={serializedFeaturedPlans} />

        {/* Gerenciamento de Usuários (Clientes e Estabelecimentos) */}
        <UsersManagement
          users={serializedUsers}
          pricingPlans={serializedPricingPlans}
        />
      </div>
    </div>
  )
}

export default AdminDashboardPage
