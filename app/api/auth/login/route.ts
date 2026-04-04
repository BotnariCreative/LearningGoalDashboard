import { verifyPassword, createSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { cookies } from 'next/headers'

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  if (!checkRateLimit(`admin-login:${ip}`)) {
    console.warn(`[auth] Rate limit exceeded for admin login from ${ip}`)
    return Response.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  try {
    const { password } = await request.json()
    if (!password || typeof password !== 'string') {
      return Response.json({ error: 'Password required' }, { status: 400 })
    }

    const valid = await verifyPassword(password)
    if (!valid) {
      console.warn(`[auth] Failed admin login attempt from ${ip}`)
      return Response.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await createSession()
    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
