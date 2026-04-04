import { getSession, getTeacherSession } from '@/lib/auth'
import { readStore } from '@/lib/goals-store'
import { loadGoalsData } from '@/lib/goals-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isAdmin = await getSession()
  const isTeacher = !isAdmin && (await getTeacherSession())

  if (!isAdmin && !isTeacher) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const categories = loadGoalsData()
  const store = await readStore()
  return Response.json({ categories, store })
}
