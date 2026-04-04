import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
}

function detectMimeType(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'image/png'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif'
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video/webm'
  if (buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return 'video/ogg'
  if (buf.length >= 12 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return 'video/mp4'
  return null
}

async function isAuthorized(): Promise<boolean> {
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  const key = new TextEncoder().encode(secret)
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, key)
    return payload.admin === true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized())) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json({ error: 'File too large (max 100 MB)' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const detectedType = detectMimeType(buffer)
    if (!detectedType) {
      return Response.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const ext = MIME_TO_EXT[detectedType]
    const slug = `${randomBytes(16).toString('hex')}.${ext}`

    // Vercel Blob in production (BLOB_READ_WRITE_TOKEN set),
    // local filesystem in development
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const blob = await put(slug, buffer, {
        access: 'public',
        contentType: detectedType,
      })
      return Response.json({ url: blob.url })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(path.join(uploadsDir, slug), buffer)
    return Response.json({ url: `/uploads/${slug}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
