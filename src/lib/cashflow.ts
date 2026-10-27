import type { FinanceSnapshot } from '../types'
import { debtDatesInMonth } from './debt'
import { monthlyGoalAmount, setAsideDayInMonth } from './goal'
import { formatMonthTitle, startOfDay, toIsoDate } from './money'
import { txDatesInMonth } from './transaction'

export type DayFlow = {
  date: string
  day: number
  income: number
  expense: number
  debt: number
  goal: number
  net: number
  running: number
  isToday: boolean
  isForecast: boolean
}

export type MonthFlow = {
  label: string
  weekdayPad: number
  income: number
  expense: number
  debt: number
  goal: number
  remaining: number
  days: DayFlow[]
}

function emptyDay(iso: string, today: Date): DayFlow {
  const date = startOfDay(new Date(iso + 'T00:00:00'))
  const now = startOfDay(today)
  return {
    date: iso,
    day: date.getDate(),
    income: 0,
    expense: 0,
    debt: 0,
    goal: 0,
    net: 0,
    running: 0,
    isToday: date.getTime() === now.getTime(),
    isForecast: date.getTime() > now.getTime(),
  }
}

export function buildMonthFlow(
  snapshot: FinanceSnapshot,
  today = new Date(),
): MonthFlow {
  const year = today.getFullYear()
  const monthIndex = today.getMonth()
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const first = new Date(year, monthIndex, 1)
  const weekdayPad = (first.getDay() + 6) % 7

  const byDate = new Map<string, DayFlow>()
  for (let day = 1; day <= lastDay; day += 1) {
    const iso = toIsoDate(new Date(year, monthIndex, day))
    byDate.set(iso, emptyDay(iso, today))
  }

  function bump(iso: string, key: 'income' | 'expense' | 'debt' | 'goal', amount: number) {
    const row = byDate.get(iso)
    if (!row || amount === 0) return
    row[key] += amount
  }

  for (const tx of snapshot.transactions) {
    for (const iso of txDatesInMonth(tx, today)) {
      bump(iso, tx.type === 'in' ? 'income' : 'expense', tx.amount)
    }
  }

  for (const debt of snapshot.debts) {
    for (const iso of debtDatesInMonth(debt, today)) {
      bump(iso, 'debt', debt.installmentAmount)
    }
  }

  for (const pot of snapshot.savingPots) {
    const months = Math.max(1, pot.months || 1)
    const monthly = monthlyGoalAmount(pot.targetAmount || pot.amount, months)
    const day = setAsideDayInMonth(pot.setAsideDay || 15, year, monthIndex)
    bump(toIsoDate(new Date(year, monthIndex, day)), 'goal', monthly)
  }

  let running = 0
  const days: DayFlow[] = []
  for (let day = 1; day <= lastDay; day += 1) {
    const iso = toIsoDate(new Date(year, monthIndex, day))
    const row = byDate.get(iso)!
    row.net = row.income - row.expense - row.debt - row.goal
    running += row.net
    row.running = running
    days.push(row)
  }

  const income = days.reduce((sum, row) => sum + row.income, 0)
  const expense = days.reduce((sum, row) => sum + row.expense, 0)
  const debt = days.reduce((sum, row) => sum + row.debt, 0)
  const goal = days.reduce((sum, row) => sum + row.goal, 0)

  return {
    label: formatMonthTitle(today),
    weekdayPad,
    income,
    expense,
    debt,
    goal,
    remaining: income - expense - debt - goal,
    days,
  }
}

export type MonthRequirement = {
  openingBalance: number
  remainingOut: number
  remainingIn: number
  remainingDebt: number
  remainingExpense: number
  remainingGoal: number
  needPerMonth: number
  needPerDay: number
  daysLeft: number
}

export function buildRequirement(
  snapshot: FinanceSnapshot,
  today = new Date(),
): MonthRequirement {
  const flow = buildMonthFlow(snapshot, today)
  const todayIso = toIsoDate(startOfDay(today))
  const past = flow.days.filter((row) => row.date < todayIso)
  const rest = flow.days.filter((row) => row.date >= todayIso)
  const openingBalance = past.reduce((sum, row) => sum + row.net, 0)
  const remainingIn = rest.reduce((sum, row) => sum + row.income, 0)
  const remainingExpense = rest.reduce((sum, row) => sum + row.expense, 0)
  const remainingDebt = rest.reduce((sum, row) => sum + row.debt, 0)
  const remainingGoal = rest.reduce((sum, row) => sum + row.goal, 0)
  const remainingOut = remainingExpense + remainingDebt + remainingGoal
  const needPerMonth = Math.max(0, remainingOut - remainingIn - openingBalance)
  const daysLeft = Math.max(1, rest.length)
  const needPerDay = Math.ceil(needPerMonth / daysLeft)

  return {
    openingBalance,
    remainingOut,
    remainingIn,
    remainingDebt,
    remainingExpense,
    remainingGoal,
    needPerMonth,
    needPerDay,
    daysLeft,
  }
}
