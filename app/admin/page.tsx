import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import { redirect } from "next/navigation"
import CreateBarbershopModal from "./_components/create-barbershop-modal"
import UsersManagement from "./_components/users-management"

const AdminDashboardPage = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect("/")
  }

  const role = (session.user as any).role

  if (session.user.email !== "pablohga@gmail.com" && role !== "ADMIN") {
    redirect("/")
  }

  if (session.user.email === "pablohga@gmail.com") {
    await db.user
      .updateMany({
        where: { email: "pablohga@gmail.com" },
        data: { role: "ADMIN" },
      })
      .catch(() => {})
  }

  const users = await db.user.findMany({
    include: {
      bookings: {
        include: {
          service: true,
        },
      },
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

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
  }))

  return (
    <div>
      <Header />
      <div className="mx-auto max-w-6xl space-y-8 p-5">
        <h1 className="text-2xl font-bold">Dashboard do Administrador</h1>

        {/* Cadastrar Conta de Barbearia */}
        <CreateBarbershopModal />

        {/* Gerenciamento de Usuários (Clientes e Barbearias) */}
        <UsersManagement users={serializedUsers} />
      </div>
    </div>
  )
}

export default AdminDashboardPage
