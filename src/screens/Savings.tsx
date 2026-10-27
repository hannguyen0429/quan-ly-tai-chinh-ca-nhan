import { useState } from 'react'
import { GoalForm } from '../components/GoalForm'
import { goalKindLabel, monthlyGoalAmount } from '../lib/goal'
import type { MoneyPlan } from '../lib/plan'
import { formatVnd } from '../lib/money'
import type { FinanceSnapshot, SavingPot } from '../types'

type Props = {
  snapshot: FinanceSnapshot
  plan: MoneyPlan
  onAdd: (item: SavingPot) => void
}

export function Savings({ snapshot, plan, onAdd }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Mục tiêu</p>
        <h1>Tiền để dành</h1>
        <p className="lede">
          Chỉ dùng cho mục tiêu dài hạn: nhà, xe, dự phòng ốm đau. Không dùng
          trả nợ hay chi tiêu hàng ngày.
        </p>
      </header>

      <section className="card">
        <p className="target-label">Tổng số mục tiêu</p>
        <p className="target-value">{formatVnd(plan.savings)}</p>
        <p className="footnote">Cộng từ các quỹ bên dưới.</p>
      </section>

      <ul className="debt-list">
        {snapshot.savingPots.length === 0 ? (
          <li className="card">
            <p className="muted">Chưa có mục tiêu nào.</p>
          </li>
        ) : (
          snapshot.savingPots.map((pot) => (
            <li key={pot.id} className="card">
              <div className="card-head">
                <h2>{pot.name}</h2>
              </div>
              <p className="muted">
                {goalKindLabel(pot.kind)} · {pot.months} tháng · ngày{' '}
                {pot.setAsideDay} hàng tháng
              </p>
              <p className="target-value target-value--sm">
                {formatVnd(pot.targetAmount)}
              </p>
              <p className="footnote">
                Mỗi kỳ trích lập {formatVnd(monthlyGoalAmount(pot.targetAmount, pot.months))}
              </p>
            </li>
          ))
        )}
      </ul>

      {open ? (
        <GoalForm
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
          Mục tiêu
        </button>
      )}
    </div>
  )
}
