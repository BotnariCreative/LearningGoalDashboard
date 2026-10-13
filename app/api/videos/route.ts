import { readdir } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Lists the reusable proof videos uploaded with `library=1` to /api/upload
export async function GET() {
  if (!(await getSession())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: 'library/' })
    return Response.json(blobs.map((b) => ({ url: b.url, name: b.pathname.slice('library/'.length) })))
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'library')
  const files = await readdir(dir).catch(() => [] as string[])
  return Response.json(files.map((f) => ({ url: `/uploads/library/${f}`, name: f })))
}
