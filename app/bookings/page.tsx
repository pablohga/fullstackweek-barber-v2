import { getServerSession } from "next-auth"
import Header from "../_components/header"
import { authOptions } from "../_lib/auth"
import BookingItem from "../_components/booking-item"
import { getConfirmedBookings } from "../_data/get-confirmed-bookings"
import { getConcludedBookings } from "../_data/get-concluded-bookings"
import {
  CalendarDaysIcon,
  LockIcon,
  ArrowRightIcon,
  ScissorsIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "../_components/ui/button"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Meus Agendamentos",
}

const Bookings = async () => {
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
                Você precisa estar conectado para visualizar e gerenciar seus
                agendamentos na VizUAU.
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

  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-3xl space-y-8 p-5 md:p-8">
        <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDaysIcon size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl">
              Meus Agendamentos
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Acompanhe seus horários confirmados e histórico de cortes
            realizados.
          </p>
        </div>

        {confirmedBookings.length === 0 && concludedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/20 p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ScissorsIcon size={28} />
            </div>
            <h3 className="text-lg font-bold">Nenhum agendamento encontrado</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Você ainda não agendou nenhum serviço. Que tal explorar nossos
              estabelecimentos parceiros agora mesmo?
            </p>
            <div className="mt-6">
              <Button asChild className="gap-2 font-semibold">
                <Link href="/">
                  Explorar Estabelecimentos
                  <ArrowRightIcon size={16} />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {confirmedBookings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Confirmados ({confirmedBookings.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {confirmedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                    />
                  ))}
                </div>
              </div>
            )}

            {concludedBookings.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Finalizados ({concludedBookings.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {concludedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings
