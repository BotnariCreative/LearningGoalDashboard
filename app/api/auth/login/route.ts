import { verifyPassword, createSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password required' }, { status: 400 })
    }

    const valid = await verifyPassword(password)
    if (!valid) {
      return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await createSession()
    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
