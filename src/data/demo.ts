import type { FinanceSnapshot } from '../types'

/** Bản trống để bắt đầu dùng thật. Không seed số liệu mẫu. */
export const demoSnapshot: FinanceSnapshot = {
  monthlyLivingCost: 0,
  circulating: 0,
  savingPots: [],
  debts: [],
  transactions: [],
}
