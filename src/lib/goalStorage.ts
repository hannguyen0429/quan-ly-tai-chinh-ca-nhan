import type { SavingPot } from '../types'
import { normalizeGoal } from './goal'

const STORAGE_KEY = 'tlch-v2-goals'

export function loadGoals(): SavingPot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavingPot[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeGoal)
  } catch {
    return []
  }
}

export function saveGoals(goals: SavingPot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals.map(normalizeGoal)))
}
