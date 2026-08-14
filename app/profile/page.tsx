import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import { db } from "../_lib/prisma"
import {
  LockIcon,
  ArrowRightIcon,
  StoreIcon,
  UserIcon,
  StarIcon,
  PhoneIcon,
  MapPinIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "../_components/ui/button"
import { Card, CardContent } from "../_components/ui/card"
import { Badge } from "../_components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "../_components/ui/avatar"
import BookingItem from "../_components/booking-item"
import { isFuture, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import ProfileEditForm from "./_components/profile-edit-form"
import RoleSwitcher from "./_components/role-switcher"
import ClientGallery from "./_components/client-gallery"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Meu Perfil",
}

const ProfilePage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-border/60 bg-card/40 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
              <LockIcon size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                Área Restrita
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Você precisa estar conectado para visualizar e gerenciar seu
                perfil na BARBERZONE.
              </p>
            </div>
            <div className="pt-2">
              <Button
                asChild
                className="w-full gap-2 font-semibold shadow-lg transition-all hover:scale-[1.02]"
              >
                <Link href="/">
                  Fazer Login / Cadastrar-se
                  <ArrowRightIcon size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const userId = (session.user as any).id
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      bookings: {
        include: {
          service: {
            include: {
              barbershop: true,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
      },
      reviews: {
        include: {
          barbershop: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      galleryImages: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!user) {
    return (
      <div>
        <Header />
        <div className="p-5 text-center">
          <p className="text-gray-400">Usuário não encontrado.</p>
        </div>
      </div>
    )
  }

  const role = user.role || "CLIENT"
  const isClient = role === "CLIENT"

  const activeBookings = user.bookings.filter(
    (booking) => isFuture(booking.date) && booking.status === "CONFIRMED",
  )
  const concludedBookings = user.bookings.filter(
    (booking) =>
      (!isFuture(booking.date) && booking.status === "CONFIRMED") ||
      booking.status === "FINISHED",
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl space-y-8 p-5 md:p-8">
        <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserIcon size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              Meu Perfil
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {isClient
              ? "Gerencie seus dados cadastrais, galeria de cortes favoritos, acompanhe seus agendamentos e veja suas avaliações."
              : "Gerencie suas informações e acesso à barbearia."}
          </p>
        </div>

        {/* Informações do Cadastro & Edição */}
        <div className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-md">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-inner">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback>
                  {user.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {user.name || "Sem Nome"}
                  </h2>
                  <Badge
                    variant={
                      role === "ADMIN"
                        ? "destructive"
                        : role === "BARBERSHOP"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.phone && (
                  <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                    <PhoneIcon size={14} /> {user.phone}
                  </p>
                )}
                {user.address && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPinIcon size={14} /> {user.address}
                  </p>
                )}
              </div>
            </div>

            <ProfileEditForm user={JSON.parse(JSON.stringify(user))} />
          </div>

          {!isClient && (
            <div className="space-y-4 border-t border-border/40 pt-6">
              <RoleSwitcher currentRole={role} />
              {role === "BARBERSHOP" && (
                <Button asChild className="w-full gap-2 font-semibold">
                  <Link href="/barbershop-dashboard">
                    <StoreIcon size={18} />
                    Acessar Painel da Barbearia
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Se for Cliente, exibir Galeria, Agendamentos Ativos, Finalizados e Qualificações */}
        {isClient && (
          <>
            {/* Galeria de Cortes e Modelos Favoritos */}
            <ClientGallery
              images={JSON.parse(JSON.stringify(user.galleryImages))}
            />

            {/* Agendamentos Ativos */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Agendamentos Ativos ({activeBookings.length})
                </h2>
              </div>

              {activeBookings.length === 0 ? (
                <Card className="border-dashed bg-card/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento ativo no momento.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Agendamentos Finalizados / Histórico */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Histórico (Finalizados / Expirados) (
                  {concludedBookings.length})
                </h2>
              </div>

              {concludedBookings.length === 0 ? (
                <Card className="border-dashed bg-card/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento no histórico encontrado.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {concludedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Qualificações Realizadas */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Qualificações Realizadas ({user.reviews.length})
                </h2>
              </div>

              {user.reviews.length === 0 ? (
                <Card className="border-dashed bg-card/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Você ainda não realizou nenhuma avaliação de barbearia.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {user.reviews.map((review) => (
                    <Card key={review.id} className="bg-card/60">
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold">
                            {review.barbershop?.name || "Barbearia"}
                          </h4>
                          <div className="flex items-center gap-1 text-amber-400">
                            <StarIcon size={14} className="fill-current" />
                            <span className="text-xs font-bold text-foreground">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-xs italic text-muted-foreground">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        )}
                        <p className="pt-1 text-[10px] text-muted-foreground">
                          {format(
                            new Date(review.createdAt),
                            "dd 'de' MMMM 'de' yyyy",
                            { locale: ptBR },
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
