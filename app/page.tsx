import { loadGoalsData } from '@/lib/goals-data'
import { readStore } from '@/lib/goals-store'
import { DashboardClient } from '@/components/DashboardClient'
import type { CategoryWithGoals, Goal } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const categories = loadGoalsData()
  const store = await readStore()

  const categoriesWithProgress: CategoryWithGoals[] = categories.map((cat) => ({
    ...cat,
    goals: cat.goals.map((goal): Goal => {
      const stored = store[goal.id]
      return {
        ...goal,
        status: (stored?.status ?? '') as '' | 'td' | 'done',
        verified: stored?.verified ?? '',
        project: stored?.project ?? '',
        bewijs: stored?.bewijs ?? '',
        documentation: stored?.documentation ?? '',
        updatedAt: stored?.updatedAt ?? '',
      }
    }),
  }))

  return <DashboardClient categories={categoriesWithProgress} />
}
