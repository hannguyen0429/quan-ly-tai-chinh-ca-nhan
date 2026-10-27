import type { MoneyPlan } from '../lib/plan'
import { formatVnd } from '../lib/money'

type Props = {
  plan: MoneyPlan
}

export function Goals({ plan }: Props) {
  const openingNote =
    plan.openingBalance >= 0
      ? `Số dư đến hết hôm qua ${formatVnd(plan.openingBalance)}`
      : `Thiếu đến hết hôm qua ${formatVnd(Math.abs(plan.openingBalance))}`

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Yêu cầu</p>
        <h1>Cần kiếm bao nhiêu</h1>
        <p className="lede">
          Tính từ Nợ, Chi phí và Mục tiêu còn lại từ hôm nay đến hết tháng, trừ
          Thu nhập. Lúc 00h mỗi ngày mốc được tính lại.
        </p>
      </header>

      <ol className="goal-stack">
        <li className="card">
          <p className="target-label">Mỗi ngày</p>
          <p className="target-value">{formatVnd(plan.needPerDay)}</p>
          <p className="footnote">
            Còn thiếu {formatVnd(plan.needPerMonth)} chia cho {plan.daysLeft}{' '}
            ngày còn lại (kể cả hôm nay).
          </p>
        </li>
        <li className="card">
          <p className="target-label">Mỗi tháng</p>
          <p className="target-value">{formatVnd(plan.needPerMonth)}</p>
          <p className="footnote">
            Còn phải ra: nợ {formatVnd(plan.remainingDebt)} + chi{' '}
            {formatVnd(plan.remainingExpense)} + mục tiêu{' '}
            {formatVnd(plan.remainingGoal)} = {formatVnd(plan.remainingOut)}.
            Thu còn lại {formatVnd(plan.remainingIn)}. {openingNote}.
          </p>
        </li>
      </ol>
    </div>
  )
}
