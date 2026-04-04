import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  const isAdmin = await getSession()
  if (!isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  ]

  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const maxSize = 100 * 1024 * 1024 // 100 MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large (max 100 MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, slug), buffer)

  return Response.json({ url: `/uploads/${slug}` })
}
