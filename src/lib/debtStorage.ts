import type { Debt } from '../types'
import { normalizeDebt } from './debt'

const STORAGE_KEY = 'tlch-v2-debts'

export function loadDebts(): Debt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Debt[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeDebt)
  } catch {
    return []
  }
}

export function saveDebts(debts: Debt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(debts))
}
