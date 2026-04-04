import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'learning-goals-jwt-secret-change-in-production'
)

async function getUserHash(id: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  return user?.passwordHash ?? null
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await getUserHash('admin')
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export async function verifyTeacherPassword(password: string): Promise<boolean> {
  const hash = await getUserHash('teacher')
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export async function createSession(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function createTeacherSession(): Promise<string> {
  return new SignJWT({ teacher: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.admin === true
  } catch {
    return false
  }
}

export async function getTeacherSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('teacher_session')?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.teacher === true
  } catch {
    return false
  }
}
