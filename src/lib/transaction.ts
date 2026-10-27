import type { Transaction, TxCycle, TxKind } from '../types'
import { parseIsoDate, startOfDay, toIsoDate } from './money'

export const txCycleOptions: { id: TxCycle; label: string }[] = [
  { id: 'week', label: '1 tuần / kỳ' },
  { id: 'twoWeeks', label: '2 tuần / kỳ' },
  { id: 'month', label: '1 tháng / kỳ' },
  { id: 'quarter', label: '3 tháng / kỳ' },
  { id: 'year', label: '1 năm / kỳ' },
]

export function txCycleLabel(unit: TxCycle): string {
  return txCycleOptions.find((item) => item.id === unit)?.label ?? unit
}

export function addTxCycle(iso: string, unit: TxCycle): string {
  const date = parseIsoDate(iso)
  if (unit === 'week') date.setDate(date.getDate() + 7)
  else if (unit === 'twoWeeks') date.setDate(date.getDate() + 14)
  else if (unit === 'month') date.setMonth(date.getMonth() + 1)
  else if (unit === 'quarter') date.setMonth(date.getMonth() + 3)
  else date.setFullYear(date.getFullYear() + 1)
  return toIsoDate(date)
}

export function txDatesInMonth(tx: Transaction, today: Date): string[] {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const startMs = startOfDay(monthStart).getTime()
  const endMs = startOfDay(monthEnd).getTime()
  const dates: string[] = []

  if (tx.kind === 'once') {
    const due = startOfDay(parseIsoDate(tx.date)).getTime()
    if (due >= startMs && due <= endMs) dates.push(toIsoDate(parseIsoDate(tx.date)))
    return dates
  }

  let cursor = tx.date
  let guard = 0
  while (startOfDay(parseIsoDate(cursor)).getTime() < startMs && guard < 120) {
    cursor = addTxCycle(cursor, tx.cycleUnit)
    guard += 1
  }

  guard = 0
  while (startOfDay(parseIsoDate(cursor)).getTime() <= endMs && guard < 40) {
    dates.push(cursor)
    cursor = addTxCycle(cursor, tx.cycleUnit)
    guard += 1
  }
  return dates
}

export function amountInMonth(
  tx: Transaction,
  today: Date,
): number {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const startMs = startOfDay(monthStart).getTime()
  const endMs = startOfDay(monthEnd).getTime()

  if (tx.kind === 'once') {
    const due = startOfDay(parseIsoDate(tx.date)).getTime()
    return due >= startMs && due <= endMs ? tx.amount : 0
  }

  let cursor = tx.date
  let guard = 0
  while (startOfDay(parseIsoDate(cursor)).getTime() < startMs && guard < 120) {
    cursor = addTxCycle(cursor, tx.cycleUnit)
    guard += 1
  }

  let total = 0
  guard = 0
  while (startOfDay(parseIsoDate(cursor)).getTime() <= endMs && guard < 40) {
    total += tx.amount
    cursor = addTxCycle(cursor, tx.cycleUnit)
    guard += 1
  }
  return total
}

export function createTransaction(input: {
  type: 'in' | 'out'
  source: string
  amount: number
  date: string
  kind: TxKind
  cycleUnit: TxCycle
}): Transaction {
  const source = input.source.trim()
  return {
    id: crypto.randomUUID(),
    type: input.type,
    source,
    note: source,
    category: input.kind === 'recurring' ? 'Cố định' : 'Một lần',
    amount: input.amount,
    date: input.date,
    kind: input.kind,
    cycleUnit: input.kind === 'once' ? 'month' : input.cycleUnit,
  }
}

export function normalizeTransaction(raw: Transaction): Transaction {
  const source = raw.source || raw.note || raw.category || ''
  return {
    ...raw,
    source,
    note: raw.note || source,
    category: raw.category || (raw.kind === 'recurring' ? 'Cố định' : 'Một lần'),
    kind: raw.kind ?? 'once',
    cycleUnit: raw.cycleUnit ?? 'month',
  }
}
