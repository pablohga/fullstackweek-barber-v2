import { Barbershop } from "@prisma/client"

export const sortBarbershops = (barbershops: Barbershop[]): Barbershop[] => {
  const now = new Date()

  return [...barbershops].sort((a, b) => {
    const aFeatured = a.featuredUntil ? new Date(a.featuredUntil) > now : false
    const bFeatured = b.featuredUntil ? new Date(b.featuredUntil) > now : false

    // 1. Featured priority (active featuredUntil comes first)
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1

    // 2. Verified priority (isVerified: true comes before unverified)
    if (a.isVerified && !b.isVerified) return -1
    if (!a.isVerified && b.isVerified) return 1

    // 3. Fallback: createdAt desc (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}
