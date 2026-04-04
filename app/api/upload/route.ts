import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'
import { randomBytes } from 'crypto'

// Map MIME types to safe extensions (derived from magic bytes, not user input)
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogg',
}

/**
 * Detect MIME type from file magic bytes.
 * Returns null if the content does not match a known safe type.
 * SVG is intentionally excluded — SVG files can contain embedded JavaScript.
 */
function detectMimeType(buf: Buffer): string | null {
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'image/png'

  // GIF: GIF8
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif'

  // WebP: RIFF????WEBP
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp'

  // WebM: 1A 45 DF A3
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'video/webm'

  // OGG: OggS
  if (buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return 'video/ogg'

  // MP4/MOV: ftyp box at offset 4
  if (
    buf.length >= 12 &&
    buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70
  ) return 'video/mp4'

  return null
}

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

  const maxSize = 100 * 1024 * 1024 // 100 MB
  if (file.size > maxSize) {
    return Response.json({ error: 'File too large (max 100 MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detectedType = detectMimeType(buffer)

  if (!detectedType) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const ext = MIME_TO_EXT[detectedType]
  // Use cryptographically random filename — never trust user-supplied filename or extension
  const slug = `${randomBytes(16).toString('hex')}.${ext}`

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, slug), buffer)

  return Response.json({ url: `/uploads/${slug}` })
}
