import { demoSnapshot } from '../data/demo'
import type { Transaction } from '../types'
import { normalizeTransaction } from './transaction'

const STORAGE_KEY = 'tlch-transactions'

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return demoSnapshot.transactions.map(normalizeTransaction)
    const parsed = JSON.parse(raw) as Transaction[]
    if (!Array.isArray(parsed)) {
      return demoSnapshot.transactions.map(normalizeTransaction)
    }
    return parsed.map(normalizeTransaction)
  } catch {
    return demoSnapshot.transactions.map(normalizeTransaction)
  }
}

export function saveTransactions(items: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}
