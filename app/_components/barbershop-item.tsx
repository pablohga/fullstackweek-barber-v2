import { Barbershop } from "@prisma/client"
import { Card, CardContent } from "./ui/card"
import Image from "next/image"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { StarIcon, ShieldCheckIcon } from "lucide-react"
import Link from "next/link"

interface BarbershopItemProps {
  barbershop: Barbershop
}

const BarbershopItem = ({ barbershop }: BarbershopItemProps) => {
  const isFeatured = barbershop.featuredUntil
    ? new Date(barbershop.featuredUntil) > new Date()
    : false

  return (
    <Card
      className={`min-w-[167px] rounded-2xl ${
        isFeatured ? "border-primary/50 shadow-md shadow-primary/10" : ""
      }`}
    >
      <CardContent className="p-0 px-1 pt-1">
        {/* IMAGEM */}
        <div className="relative h-[159px] w-full">
          <Image
            alt={barbershop.name}
            fill
            className="rounded-2xl object-cover"
            src={barbershop.imageUrl}
          />

          <Badge
            className="absolute left-2 top-2 space-x-1"
            variant="secondary"
          >
            <StarIcon size={12} className="fill-primary text-primary" />
            <p className="text-xs font-semibold">5,0</p>
          </Badge>

          {isFeatured && (
            <Badge
              className="absolute right-2 top-2 text-[10px] font-bold"
              variant="default"
            >
              Destaque
            </Badge>
          )}
        </div>

        {/* TEXTO */}
        <div className="px-1 py-3">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold">{barbershop.name}</h3>
            {barbershop.isVerified && (
              <span
                title="Estabelecimento Verificado"
                className="inline-flex items-center"
              >
                <ShieldCheckIcon size={16} className="shrink-0 text-primary" />
              </span>
            )}
          </div>
          <p className="truncate text-sm text-gray-400">{barbershop.address}</p>
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href={`/barbershops/${barbershop.id}`}>Reservar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
