import type { Debt, PayMode, PeriodUnit } from '../types'
import { parseIsoDate, startOfDay, toIsoDate } from './money'

export const periodUnitOptions: { id: PeriodUnit; label: string }[] = [
  { id: 'week', label: '1 tuần / kỳ' },
  { id: 'month', label: '1 tháng / kỳ' },
  { id: 'twoMonths', label: '2 tháng / kỳ' },
  { id: 'threeMonths', label: '3 tháng / kỳ' },
]

export function periodUnitLabel(unit: PeriodUnit): string {
  return periodUnitOptions.find((item) => item.id === unit)?.label ?? unit
}

export function installmentAmount(total: number, periods: number): number {
  if (periods <= 1) return total
  return Math.round(total / periods)
}

export function remainingPrincipal(debt: Debt): number {
  if (debt.totalInstallments <= 0) return 0
  return Math.round(
    (debt.totalAmount * debt.remainingInstallments) / debt.totalInstallments,
  )
}

export function addPeriods(
  iso: string,
  unit: PeriodUnit,
  count = 1,
): string {
  const date = parseIsoDate(iso)
  if (unit === 'week') {
    date.setDate(date.getDate() + 7 * count)
  } else {
    const months = unit === 'month' ? 1 : unit === 'twoMonths' ? 2 : 3
    date.setMonth(date.getMonth() + months * count)
  }
  return toIsoDate(date)
}

export function debtDatesInMonth(debt: Debt, today: Date): string[] {
  if (debt.remainingInstallments <= 0) return []
  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1))
  const monthEnd = startOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0))
  const dates: string[] = []
  let cursor = debt.nextDueDate
  let left = debt.remainingInstallments
  let guard = 0
  while (left > 0 && guard < 48) {
    const due = startOfDay(parseIsoDate(cursor))
    if (due.getTime() > monthEnd.getTime()) break
    if (due.getTime() < monthStart.getTime()) {
      dates.push(toIsoDate(monthStart))
    } else {
      dates.push(toIsoDate(due))
    }
    cursor = addPeriods(cursor, debt.periodUnit)
    left -= 1
    guard += 1
  }
  return dates
}

export function daysUntilDue(iso: string, today = new Date()): number {
  const due = startOfDay(parseIsoDate(iso)).getTime()
  const now = startOfDay(today).getTime()
  return Math.round((due - now) / 86_400_000)
}

export function createDebt(input: {
  name: string
  lender: string
  totalAmount: number
  payMode: PayMode
  periodCount: number
  periodUnit: PeriodUnit
  dueDate: string
}): Debt {
  const totalInstallments = input.payMode === 'once' ? 1 : input.periodCount
  const per = installmentAmount(input.totalAmount, totalInstallments)
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    lender: input.lender.trim(),
    totalAmount: input.totalAmount,
    remaining: input.totalAmount,
    payMode: input.payMode,
    periodUnit: input.periodUnit,
    totalInstallments,
    remainingInstallments: totalInstallments,
    installmentAmount: per,
    firstDueDate: input.dueDate,
    nextDueDate: input.dueDate,
    paidThisCycle: false,
  }
}

export function markPeriodPaid(debt: Debt): Debt {
  if (debt.remainingInstallments <= 0) return debt
  const remainingInstallments = debt.remainingInstallments - 1
  return {
    ...debt,
    remainingInstallments,
    remaining: remainingPrincipal({ ...debt, remainingInstallments }),
    nextDueDate:
      remainingInstallments > 0
        ? addPeriods(debt.nextDueDate, debt.periodUnit)
        : debt.nextDueDate,
    paidThisCycle: remainingInstallments === 0,
  }
}

export function payOffEarly(debt: Debt): Debt {
  if (debt.remainingInstallments <= 0) return debt
  return {
    ...debt,
    remainingInstallments: 0,
    remaining: 0,
    paidThisCycle: true,
  }
}

export function normalizeDebt(raw: Debt): Debt {
  const totalInstallments = raw.totalInstallments || raw.remainingInstallments || 1
  const totalAmount = raw.totalAmount || raw.remaining
  const payMode: PayMode =
    raw.payMode ?? (totalInstallments <= 1 ? 'once' : 'installment')
  const remainingInstallments = raw.remainingInstallments ?? totalInstallments
  return {
    ...raw,
    totalAmount,
    payMode,
    periodUnit: raw.periodUnit ?? 'month',
    totalInstallments,
    remainingInstallments,
    installmentAmount:
      raw.installmentAmount || installmentAmount(totalAmount, totalInstallments),
    firstDueDate: raw.firstDueDate || raw.nextDueDate,
    remaining: remainingPrincipal({
      ...raw,
      totalAmount,
      totalInstallments,
      remainingInstallments,
    }),
  }
}
