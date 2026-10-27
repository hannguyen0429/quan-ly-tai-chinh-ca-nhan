import type { Debt, FinanceSnapshot } from '../types'
import { buildRequirement } from './cashflow'
import { parseIsoDate, startOfDay } from './money'
import { amountInMonth } from './transaction'

export type MoneyPlan = {
  totalDebt: number
  debtReserve: number
  savings: number
  circulating: number
  overdueDebts: Debt[]
  dueThisMonth: Debt[]
  dueNextMonth: Debt[]
  upcomingDebts: Debt[]
  nextDebt: Debt | null
  debtDueThisMonth: number
  incomeThisMonth: number
  expenseThisMonth: number
  cashThisMonth: number
  obligationsThisMonth: number
  remainingToEarnThisMonth: number
  remainingOut: number
  remainingIn: number
  remainingDebt: number
  remainingExpense: number
  remainingGoal: number
  openingBalance: number
  needPerDay: number
  needPerMonth: number
  daysLeft: number
  inDebtMode: boolean
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function monthKey(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth()
}

function sortByDue(a: Debt, b: Debt): number {
  return parseIsoDate(a.nextDueDate).getTime() - parseIsoDate(b.nextDueDate).getTime()
}

function unpaid(debt: Debt): boolean {
  return debt.remainingInstallments > 0
}

export function buildPlan(snapshot: FinanceSnapshot, today = new Date()): MoneyPlan {
  const now = startOfDay(today)
  const requirement = buildRequirement(snapshot, now)
  const thisKey = monthKey(now)

  const totalDebt = snapshot.debts.reduce((sum, debt) => sum + debt.remaining, 0)

  const overdueDebts = snapshot.debts
    .filter((debt) => {
      const due = startOfDay(parseIsoDate(debt.nextDueDate))
      return unpaid(debt) && due.getTime() < now.getTime()
    })
    .sort(sortByDue)

  const dueThisMonth = snapshot.debts
    .filter((debt) => {
      const due = startOfDay(parseIsoDate(debt.nextDueDate))
      return unpaid(debt) && due.getTime() >= now.getTime() && sameMonth(due, now)
    })
    .sort(sortByDue)

  const dueNextMonth = snapshot.debts
    .filter((debt) => {
      const due = startOfDay(parseIsoDate(debt.nextDueDate))
      return unpaid(debt) && monthKey(due) === thisKey + 1
    })
    .sort(sortByDue)

  const attentionDebts = [...overdueDebts, ...dueThisMonth, ...dueNextMonth]
  const debtReserve = attentionDebts.reduce(
    (sum, debt) => sum + debt.installmentAmount,
    0,
  )

  const upcomingDebts = [...dueThisMonth, ...dueNextMonth]
  const nextDebt = overdueDebts[0] ?? upcomingDebts[0] ?? null

  const debtDueThisMonth = [...overdueDebts, ...dueThisMonth].reduce(
    (sum, debt) => sum + debt.installmentAmount,
    0,
  )

  const incomeThisMonth = snapshot.transactions
    .filter((tx) => tx.type === 'in')
    .reduce((sum, tx) => sum + amountInMonth(tx, now), 0)
  const expenseThisMonth = snapshot.transactions
    .filter((tx) => tx.type === 'out')
    .reduce((sum, tx) => sum + amountInMonth(tx, now), 0)

  const obligationsThisMonth = requirement.remainingOut
  const remainingToEarnThisMonth = requirement.needPerMonth

  return {
    totalDebt,
    debtReserve,
    savings: snapshot.savingPots.reduce(
      (sum, pot) => sum + (pot.targetAmount || pot.amount),
      0,
    ),
    circulating: snapshot.circulating,
    overdueDebts,
    dueThisMonth,
    dueNextMonth,
    upcomingDebts,
    nextDebt,
    debtDueThisMonth,
    incomeThisMonth,
    expenseThisMonth,
    cashThisMonth: incomeThisMonth - expenseThisMonth,
    obligationsThisMonth,
    remainingToEarnThisMonth,
    remainingOut: requirement.remainingOut,
    remainingIn: requirement.remainingIn,
    remainingDebt: requirement.remainingDebt,
    remainingExpense: requirement.remainingExpense,
    remainingGoal: requirement.remainingGoal,
    openingBalance: requirement.openingBalance,
    needPerDay: requirement.needPerDay,
    needPerMonth: requirement.needPerMonth,
    daysLeft: requirement.daysLeft,
    inDebtMode: totalDebt > 0,
  }
}
