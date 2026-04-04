import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const jsonPath = path.join(process.cwd(), 'data', 'goals.json')

  if (!fs.existsSync(jsonPath)) {
    console.log('No data/goals.json found — nothing to seed.')
    return
  }

  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as Record<
    string,
    {
      status?: string
      verified?: string
      verifiedBy?: string
      project?: string
      bewijs?: string
      documentation?: string
      updatedAt?: string
    }
  >

  const entries = Object.entries(raw)
  console.log(`Seeding ${entries.length} goal(s)…`)

  for (const [id, data] of entries) {
    await prisma.goalProgress.upsert({
      where: { id },
      create: {
        id,
        status:        data.status        ?? '',
        verified:      data.verified      ?? '',
        verifiedBy:    data.verifiedBy    ?? '',
        project:       data.project       ?? '',
        bewijs:        data.bewijs        ?? '',
        documentation: data.documentation ?? '',
        updatedAt:     data.updatedAt     ?? '',
      },
      update: {
        status:        data.status        ?? '',
        verified:      data.verified      ?? '',
        verifiedBy:    data.verifiedBy    ?? '',
        project:       data.project       ?? '',
        bewijs:        data.bewijs        ?? '',
        documentation: data.documentation ?? '',
        updatedAt:     data.updatedAt     ?? '',
      },
    })
  }

  // Seed users from data/auth.json and data/teacher-auth.json
  const users = [
    { id: 'admin', file: 'data/auth.json' },
    { id: 'teacher', file: 'data/teacher-auth.json' },
  ]

  for (const { id, file } of users) {
    const filePath = path.join(process.cwd(), file)
    if (!fs.existsSync(filePath)) continue
    const { hash } = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (!hash) continue
    await prisma.user.upsert({
      where: { id },
      create: { id, passwordHash: hash },
      update: { passwordHash: hash },
    })
    console.log(`Seeded user: ${id}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
