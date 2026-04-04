import { getSession, getTeacherSession } from '@/lib/auth'
import { updateGoalProgress, getGoalProgress } from '@/lib/goals-store'

export const dynamic = 'force-dynamic'

// Allowed values for each field
const VALID_STATUS = new Set(['', 'td', 'done'])
const VALID_VERIFIED = new Set(['', 'yes', 'no'])
const MAX_STR = 200
const MAX_DOC = 200_000

function validateAdminFields(body: Record<string, unknown>): string | null {
  if ('status' in body) {
    if (typeof body.status !== 'string' || !VALID_STATUS.has(body.status))
      return 'Invalid status value'
  }
  if ('project' in body) {
    if (typeof body.project !== 'string' || body.project.length > MAX_STR)
      return `project must be a string (max ${MAX_STR} chars)`
  }
  if ('bewijs' in body) {
    if (typeof body.bewijs !== 'string' || body.bewijs.length > MAX_STR)
      return `bewijs must be a string (max ${MAX_STR} chars)`
  }
  if ('documentation' in body) {
    if (typeof body.documentation !== 'string' || body.documentation.length > MAX_DOC)
      return `documentation must be a string (max ${MAX_DOC} chars)`
  }
  return null
}

function validateTeacherFields(body: Record<string, unknown>): string | null {
  if ('verified' in body) {
    if (typeof body.verified !== 'string' || !VALID_VERIFIED.has(body.verified))
      return 'Invalid verified value'
  }
  if ('verifiedBy' in body) {
    if (typeof body.verifiedBy !== 'string' || body.verifiedBy.length > 100)
      return 'verifiedBy must be a string (max 100 chars)'
  }
  return null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await getSession()
  const isTeacher = !isAdmin && (await getTeacherSession())

  if (!isAdmin && !isTeacher) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const allowedKeys = isTeacher
    ? ['verified', 'verifiedBy']
    : ['status', 'project', 'bewijs', 'documentation']

  const filtered = Object.fromEntries(
    Object.entries(body as Record<string, unknown>).filter(([k]) => allowedKeys.includes(k))
  )

  const validationError = isTeacher
    ? validateTeacherFields(filtered)
    : validateAdminFields(filtered)

  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 })
  }

  await updateGoalProgress(id, filtered)
  return Response.json({ success: true })
}
