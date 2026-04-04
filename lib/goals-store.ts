import { prisma } from './prisma'
import type { GoalProgress } from '@/types'

type PrismaGoalProgressRow = Awaited<ReturnType<typeof prisma.goalProgress.findMany>>[number]

const defaults: Omit<GoalProgress, 'updatedAt'> = {
  status: '',
  verified: '',
  verifiedBy: '',
  project: '',
  bewijs: '',
  documentation: '',
}

function toProgress(row: PrismaGoalProgressRow): GoalProgress {
  return {
    status: row.status as GoalProgress['status'],
    verified: row.verified,
    verifiedBy: row.verifiedBy,
    project: row.project,
    bewijs: row.bewijs,
    documentation: row.documentation,
    updatedAt: row.updatedAt,
  }
}

export async function readStore(): Promise<Record<string, GoalProgress>> {
  const rows: PrismaGoalProgressRow[] = await prisma.goalProgress.findMany()
  return Object.fromEntries(rows.map((row) => [row.id, toProgress(row)]))
}

export async function getGoalProgress(id: string): Promise<GoalProgress> {
  const row = await prisma.goalProgress.findUnique({ where: { id } })
  if (!row) return { ...defaults, updatedAt: '' }
  return toProgress(row)
}

export async function updateGoalProgress(
  id: string,
  progress: Partial<GoalProgress>
): Promise<void> {
  const { updatedAt: _ignored, ...data } = progress as GoalProgress
  const now = new Date().toISOString()

  await prisma.goalProgress.upsert({
    where: { id },
    create: { ...defaults, ...data, id, updatedAt: now },
    update: { ...data, updatedAt: now },
  })
}
