import fs from 'fs'
import path from 'path'
import type { BaseGoal } from '@/types'

export interface Category {
  key: string
  number: number
  name: string
  goals: BaseGoal[]
}

export function loadGoalsData(): Category[] {
  const filePath = path.join(process.cwd(), 'docs', 'LEARNING_GOALS.md')
  const content = fs.readFileSync(filePath, 'utf-8')
  const jsonStr = content
    .replace(/^\s*const\s+\w+\s*=\s*/, '')
    .replace(/;\s*$/, '')
    .replace(/,(\s*[}\]])/g, '$1')
    .trim()
  const raw = JSON.parse(jsonStr) as Record<
    string,
    Record<string, { type: string[]; status: string; verified: string; project: string; bewijs: string }>
  >

  return Object.entries(raw).map(([categoryKey, goals]) => {
    const parts = categoryKey.match(/^(\d+)\s+(.+)$/)
    const categoryNumber = parts ? parseInt(parts[1]) : 0
    const categoryName = parts ? parts[2] : categoryKey

    return {
      key: categoryKey,
      number: categoryNumber,
      name: categoryName,
      goals: Object.entries(goals).map(([goalText, data]) => {
        const numMatch = goalText.match(/^(\d+\.\d+)/)
        const number = numMatch ? numMatch[1] : ''
        const id = number
          ? number.replace('.', '_')
          : goalText
              .slice(0, 20)
              .replace(/[^a-z0-9]/gi, '_')
              .toLowerCase()
        return {
          id,
          number,
          text: goalText.trim(),
          types: data.type || [],
          category: categoryKey,
          categoryNumber,
          categoryName,
        }
      }),
    }
  })
}
