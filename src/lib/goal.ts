import type { GoalKind, SavingPot } from '../types'

export const goalKindOptions: { id: GoalKind; label: string }[] = [
  { id: 'home', label: 'Nhà' },
  { id: 'vehicle', label: 'Xe' },
  { id: 'health', label: 'Y tế' },
  { id: 'education', label: 'Giáo dục' },
  { id: 'travel', label: 'Du lịch' },
  { id: 'other', label: 'Khác' },
]

export function goalKindLabel(kind: GoalKind): string {
  return goalKindOptions.find((item) => item.id === kind)?.label ?? kind
}

function isGoalKind(value: unknown): value is GoalKind {
  return goalKindOptions.some((item) => item.id === value)
}

export function clampSetAsideDay(day: number): number {
  if (!Number.isFinite(day)) return 15
  return Math.min(31, Math.max(1, Math.floor(day)))
}

export function setAsideDayInMonth(day: number, year: number, monthIndex: number): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  return Math.min(clampSetAsideDay(day), lastDay)
}

export function monthlyGoalAmount(targetAmount: number, months: number): number {
  return Math.round(targetAmount / Math.max(1, months))
}

export function createGoal(input: {
  name: string
  months: number
  targetAmount: number
  setAsideDay: number
  kind: GoalKind
}): SavingPot {
  const targetAmount = Math.round(input.targetAmount)
  const months = Math.max(1, Math.floor(input.months))
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    purpose: goalKindLabel(input.kind),
    amount: targetAmount,
    targetAmount,
    months,
    setAsideDay: clampSetAsideDay(input.setAsideDay),
    kind: input.kind,
  }
}

export function normalizeGoal(raw: SavingPot): SavingPot {
  const target =
    Number.isFinite(raw.targetAmount) && raw.targetAmount > 0
      ? Math.round(raw.targetAmount)
      : Math.round(Number(raw.amount) || 0)
  const kind = isGoalKind(raw.kind) ? raw.kind : 'other'
  return {
    id: raw.id,
    name: raw.name.trim(),
    purpose: raw.purpose?.trim() || goalKindLabel(kind),
    amount: target,
    targetAmount: target,
    months: Math.max(1, Math.floor(Number(raw.months) || 1)),
    setAsideDay: clampSetAsideDay(
      Number.isFinite(Number(raw.setAsideDay)) && Number(raw.setAsideDay) >= 1
        ? Number(raw.setAsideDay)
        : 15,
    ),
    kind,
  }
}
