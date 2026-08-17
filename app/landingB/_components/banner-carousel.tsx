"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface Banner {
  id: string
  imageUrl: string
  title?: string | null
  linkUrl?: string | null
  order: number
}

interface BannerCarouselProps {
  banners: Banner[]
}

export const BannerCarousel = ({ banners }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!banners || banners.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners])

  if (!banners || banners.length === 0) return null

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  return (
    <div className="group relative h-[200px] w-full overflow-hidden rounded-3xl border shadow-2xl sm:h-[350px] lg:h-[480px]">
      {/* Slides */}
      <div className="relative h-full w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Banner VizUAU"}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 sm:p-8">
              {banner.title && (
                <h2 className="text-lg font-bold text-white drop-shadow-md sm:text-2xl">
                  {banner.title}
                </h2>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 focus:outline-none group-hover:opacity-100"
        aria-label="Banner Anterior"
      >
        <ChevronLeftIcon size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 focus:outline-none group-hover:opacity-100"
        aria-label="Próximo Banner"
      >
        <ChevronRightIcon size={24} />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-3 right-6 z-20 flex items-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === currentIndex ? "w-8 bg-primary" : "w-2.5 bg-white/50"
            }`}
            aria-label={`Ir para banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
