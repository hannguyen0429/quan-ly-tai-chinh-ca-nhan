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

export function Expenses({ snapshot, plan, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const items = snapshot.transactions.filter((tx) => tx.type === 'out')

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Chi phí</p>
        <h1>Tiền ra</h1>
        <p className="lede">
          Cập nhật hàng ngày. Tháng này đã chi {formatVnd(plan.expenseThisMonth)}.
        </p>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>Tháng này</h2>
        </div>
        <dl className="stat-row">
          <div>
            <dt>Đã chi</dt>
            <dd className="negative">{formatVnd(plan.expenseThisMonth)}</dd>
          </div>
          <div>
            <dt>Ngân sách sinh hoạt</dt>
            <dd>{formatVnd(snapshot.monthlyLivingCost)}</dd>
          </div>
          <div>
            <dt>Còn trong ngân sách</dt>
            <dd>
              {formatVnd(
                Math.max(0, snapshot.monthlyLivingCost - plan.expenseThisMonth),
              )}
            </dd>
          </div>
        </dl>
        <p className="footnote">
          Chi sinh hoạt lấy từ tiền lưu thông, không lấy từ trích lập trả nợ hay
          mục tiêu.
        </p>
      </section>

      <section>
        <h2 className="list-title">Các khoản chi</h2>
        <TransactionList items={items} emptyText="Chưa có khoản chi nào." />
      </section>

      {open ? (
        <MoneyEntryForm
          type="out"
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
          Chi phí
        </button>
      )}
    </div>
  )
}