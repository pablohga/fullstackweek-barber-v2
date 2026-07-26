import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter })
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({ adapter })
  }
  prisma = global.cachedPrisma
}

export const db = prisma
