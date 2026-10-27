import { demoSnapshot } from '../data/demo'
import type { SavingPot } from '../types'
import { normalizeGoal } from './goal'

const STORAGE_KEY = 'tlch-goals'

export function loadGoals(): SavingPot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return demoSnapshot.savingPots.map(normalizeGoal)
    const parsed = JSON.parse(raw) as SavingPot[]
    if (!Array.isArray(parsed)) return demoSnapshot.savingPots.map(normalizeGoal)
    return parsed.map(normalizeGoal)
  } catch {
    return demoSnapshot.savingPots.map(normalizeGoal)
  }
}

export function saveGoals(goals: SavingPot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals.map(normalizeGoal)))
}
