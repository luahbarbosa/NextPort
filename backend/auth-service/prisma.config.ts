import "dotenv/config"
import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://admin:senha123@localhost:5432/interfone"

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    adapter: () => new PrismaPg({ connectionString: DATABASE_URL }),
  },
})