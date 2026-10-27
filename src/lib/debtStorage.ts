import { demoSnapshot } from '../data/demo'
import type { Debt } from '../types'
import { normalizeDebt } from './debt'

const STORAGE_KEY = 'tlch-debts'

export function loadDebts(): Debt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return demoSnapshot.debts.map(normalizeDebt)
    const parsed = JSON.parse(raw) as Debt[]
    if (!Array.isArray(parsed)) return demoSnapshot.debts.map(normalizeDebt)
    return parsed.map(normalizeDebt)
  } catch {
    return demoSnapshot.debts.map(normalizeDebt)
  }
}

export function saveDebts(debts: Debt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(debts))
}
