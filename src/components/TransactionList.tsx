import { formatDate, formatVnd } from '../lib/money'
import { txCycleLabel } from '../lib/transaction'
import type { Transaction } from '../types'

type Props = {
  items: Transaction[]
  emptyText: string
}

export function TransactionList({ items, emptyText }: Props) {
  if (items.length === 0) {
    return <p className="muted">{emptyText}</p>
  }

  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <ul className="tx-list">
      {sorted.map((tx) => (
        <li key={tx.id} className="tx-row">
          <div>
            <p className="tx-note">{tx.source || tx.note}</p>
            <p className="muted">
              {tx.kind === 'once' ? '1 lần · 1 kỳ' : txCycleLabel(tx.cycleUnit)} ·{' '}
              {formatDate(tx.date)}
            </p>
          </div>
          <p className={tx.type === 'in' ? 'positive' : 'negative'}>
            {tx.type === 'in' ? '+' : '−'}
            {formatVnd(tx.amount)}
          </p>
        </li>
      ))}
    </ul>
  )
}
