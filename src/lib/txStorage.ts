import type { Transaction } from '../types'
import { normalizeTransaction } from './transaction'

const STORAGE_KEY = 'tlch-v2-transactions'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Transaction[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeTransaction)
  } catch {
    return []
  }
}

export function saveTransactions(items: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
