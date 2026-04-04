import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { loadGoalsData } from '@/lib/goals-data'
import { readStore } from '@/lib/goals-store'
import { AdminDashboardClient } from '@/components/AdminDashboardClient'
import type { CategoryWithGoals, Goal } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const isAdmin = await getSession()
  if (!isAdmin) redirect('/admin')

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
        verifiedBy: stored?.verifiedBy ?? '',
        project: stored?.project ?? '',
        bewijs: stored?.bewijs ?? '',
        documentation: stored?.documentation ?? '',
        updatedAt: stored?.updatedAt ?? '',
      }
    }),
  }))

  return <AdminDashboardClient categories={categoriesWithProgress} />
}
