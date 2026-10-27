export type PayMode = 'once' | 'installment'
export type PeriodUnit = 'week' | 'month' | 'twoMonths' | 'threeMonths'

export type Debt = {
  id: string
  name: string
  lender: string
  totalAmount: number
  remaining: number
  payMode: PayMode
  periodUnit: PeriodUnit
  totalInstallments: number
  remainingInstallments: number
  installmentAmount: number
  firstDueDate: string
  nextDueDate: string
  paidThisCycle: boolean
}

export type TxKind = 'once' | 'recurring'
export type TxCycle = 'week' | 'twoWeeks' | 'month' | 'quarter' | 'year'

export type Transaction = {
  id: string
  type: 'in' | 'out'
  amount: number
  source: string
  category: string
  note: string
  date: string
  kind: TxKind
  cycleUnit: TxCycle
}

export type GoalKind = 'home' | 'vehicle' | 'health' | 'education' | 'travel' | 'other'

export type SavingPot = {
  id: string
  name: string
  purpose: string
  amount: number
  targetAmount: number
  months: number
  setAsideDay: number
  kind: GoalKind
}

export type FinanceSnapshot = {
  debts: Debt[]
  transactions: Transaction[]
  savingPots: SavingPot[]
  monthlyLivingCost: number
  circulating: number
}
