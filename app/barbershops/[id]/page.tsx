import PhoneItem from "@/app/_components/phone-item"
import ServiceItem from "@/app/_components/service-item"
import SidebarSheet from "@/app/_components/sidebar-sheet"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet"
import { db } from "@/app/_lib/prisma"
import {
  ChevronLeftIcon,
  MapPinIcon,
  MenuIcon,
  StarIcon,
  ShieldCheckIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReviewForm from "./_components/review-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"

interface BarbershopPageProps {
  params: {
    id: string
  }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const session = await getServerSession(authOptions)

  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
      professionals: {
        where: {
          active: true,
        },
      },
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!barbershop) {
    return notFound()
  }

  const totalReviews = barbershop.reviews.length
  const averageRating =
    totalReviews > 0
      ? (
          barbershop.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
          totalReviews
        ).toFixed(1)
      : "5.0"

  return (
    <div>
      {/* IMAGEM */}
      <div className="relative h-[250px] w-full">
        <Image
          alt={barbershop.name}
          src={barbershop?.imageUrl}
          fill
          className="object-cover"
        />

        <Button
          size="icon"
          variant="secondary"
          className="absolute left-4 top-4"
          asChild
        >
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="absolute right-4 top-4"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SidebarSheet />
        </Sheet>
      </div>

      {/* TÍTULO */}
      <div className="border-b border-solid p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{barbershop.name}</h1>
            {barbershop.isVerified && (
              <span
                title="Barbearia Verificada"
                className="inline-flex items-center"
              >
                <ShieldCheckIcon size={20} className="shrink-0 text-primary" />
              </span>
            )}
          </div>
          {barbershop.featuredUntil &&
            new Date(barbershop.featuredUntil) > new Date() && (
              <Badge variant="default">Destaque</Badge>
            )}
        </div>
        <div className="mb-2 flex items-center gap-2">
          <MapPinIcon className="text-primary" size={18} />
          <p className="text-sm">{barbershop?.address}</p>
        </div>

        <div className="flex items-center gap-2">
          <StarIcon className="fill-primary text-primary" size={18} />
          <p className="text-sm">
            {averageRating} ({totalReviews} avaliações)
          </p>
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="space-y-2 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Sobre nós</h2>
        <p className="text-justify text-sm">{barbershop?.description}</p>
      </div>

      {/* SERVIÇOS */}
      <div className="space-y-3 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">Serviços</h2>
        <div className="space-y-3">
          {barbershop.services.map((service) => (
            <ServiceItem
              key={service.id}
              barbershop={JSON.parse(JSON.stringify(barbershop))}
              service={JSON.parse(JSON.stringify(service))}
            />
          ))}
        </div>
      </div>

      {/* AVALIAÇÕES / QUALIFICAÇÃO */}
      <div className="space-y-4 border-b border-solid p-5">
        <h2 className="text-xs font-bold uppercase text-gray-400">
          Avaliações e Qualificação
        </h2>
        {session?.user && <ReviewForm barbershopId={barbershop.id} />}

        <div className="space-y-3 pt-2">
          {barbershop.reviews.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma avaliação ainda.</p>
          ) : (
            barbershop.reviews.map((review) => (
              <div key={review.id} className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">
                    {review.user?.name || "Cliente"}
                  </p>
                  <div className="flex items-center gap-1">
                    <StarIcon className="fill-primary text-primary" size={14} />
                    <span className="text-sm font-semibold">
                      {review.rating}.0
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-300">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CONTATO */}
      <div className="space-y-3 p-5">
        {barbershop.phones.map((phone) => (
          <PhoneItem key={phone} phone={phone} />
        ))}
      </div>
    </div>
  )
}

export default BarbershopPage
