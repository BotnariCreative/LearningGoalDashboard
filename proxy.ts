import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set')
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

async function hasValidClaim(token: string, claim: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload[claim] === true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get('admin_session')?.value
    if (!token || !(await hasValidClaim(token, 'admin'))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  if (pathname.startsWith('/teacher/dashboard')) {
    const token = request.cookies.get('teacher_session')?.value
    if (!token || !(await hasValidClaim(token, 'teacher'))) {
      return NextResponse.redirect(new URL('/teacher', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/goals/:path*', '/teacher/dashboard/:path*'],
}
