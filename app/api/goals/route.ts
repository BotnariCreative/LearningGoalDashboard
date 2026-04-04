import { readStore } from '@/lib/goals-store'
import { loadGoalsData } from '@/lib/goals-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = loadGoalsData()
  const store = await readStore()
  return Response.json({ categories, store })
}
