import { getSession, getTeacherSession } from '@/lib/auth'
import { updateGoalProgress, getGoalProgress } from '@/lib/goals-store'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const progress = await getGoalProgress(id)
  return Response.json(progress)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await getSession()
  const isTeacher = !isAdmin && (await getTeacherSession())

  if (!isAdmin && !isTeacher) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const allowed = isTeacher
    ? ['verified', 'verifiedBy']
    : ['status', 'project', 'bewijs', 'documentation']

  const filtered = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  )

  await updateGoalProgress(id, filtered)
  return Response.json({ success: true })
}
