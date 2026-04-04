import { getTeacherSession } from '@/lib/auth'
import { loadGoalsData } from '@/lib/goals-data'
import { readStore } from '@/lib/goals-store'
import { TeacherDashboardClient } from '@/components/TeacherDashboardClient'
import { redirect } from 'next/navigation'
import type { CategoryWithGoals, Goal } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboardPage() {
  const isTeacher = await getTeacherSession()
  if (!isTeacher) {
    redirect('/teacher')
  }

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

  return <TeacherDashboardClient categories={categoriesWithProgress} />
}
