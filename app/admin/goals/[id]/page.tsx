import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { loadGoalsData } from '@/lib/goals-data'
import { getGoalProgress } from '@/lib/goals-store'
import { GoalEditorClient } from '@/components/GoalEditorClient'
import type { Goal } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function GoalEditorPage({ params }: PageProps) {
  const isAdmin = await getSession()
  if (!isAdmin) redirect('/admin')

  const { id } = await params

  const categories = loadGoalsData()
  const allGoals = categories.flatMap((c) => c.goals)
  const baseGoal = allGoals.find((g) => g.id === id)

  if (!baseGoal) notFound()

  const progress = await getGoalProgress(id)

  const goal: Goal = {
    ...baseGoal,
    status: (progress.status ?? '') as '' | 'td' | 'done',
    verified: progress.verified ?? '',
    verifiedBy: progress.verifiedBy ?? '',
    project: progress.project ?? '',
    bewijs: progress.bewijs ?? '',
    documentation: progress.documentation ?? '',
    updatedAt: progress.updatedAt ?? '',
  }

  return <GoalEditorClient goal={goal} />
}
