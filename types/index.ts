export interface BaseGoal {
  id: string
  number: string
  text: string
  types: string[]
  category: string
  categoryNumber: number
  categoryName: string
}

export interface GoalProgress {
  status: '' | 'td' | 'done'
  verified: string
  verifiedBy: string
  project: string
  bewijs: string
  documentation: string
  updatedAt: string
}

export interface Goal extends BaseGoal, GoalProgress {}

export interface CategoryWithGoals {
  key: string
  number: number
  name: string
  goals: Goal[]
}
