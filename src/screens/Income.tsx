import { useState } from 'react'
import type { MoneyPlan } from '../lib/plan'
import { formatVnd } from '../lib/money'
import { MoneyEntryForm } from '../components/MoneyEntryForm'
import { TransactionList } from '../components/TransactionList'
import type { FinanceSnapshot, Transaction } from '../types'

type Props = {
  snapshot: FinanceSnapshot
  plan: MoneyPlan
  onAdd: (item: Transaction) => void
}

export function Income({ snapshot, plan, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const items = snapshot.transactions.filter((tx) => tx.type === 'in')

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Thu nhập</p>
        <h1>Tiền vào</h1>
        <p className="lede">
          Cập nhật hàng ngày. Tháng này đã thu {formatVnd(plan.incomeThisMonth)}.
        </p>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>Tháng này</h2>
        </div>
        <p className="target-value target-value--sm positive">
          {formatVnd(plan.incomeThisMonth)}
        </p>
        <p className="footnote">
          Còn cần kiếm thêm {formatVnd(plan.needPerMonth)} để đủ nghĩa vụ tháng.
        </p>
      </section>

      <section>
        <h2 className="list-title">Các khoản thu</h2>
        <TransactionList items={items} emptyText="Chưa có khoản thu nào." />
      </section>

      {open ? (
        <MoneyEntryForm
          type="in"
          onConfirm={(item) => {
            onAdd(item)
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setOpen(true)}
        >
          Thu nhập
        </button>
      )}
    </div>
  )
}
