import type { MoneyPlan } from '../lib/plan'
import { formatDate, formatVnd } from '../lib/money'
import type { Debt, FinanceSnapshot } from '../types'

type Props = {
  snapshot: FinanceSnapshot
  plan: MoneyPlan
}

function DebtRows({
  debts,
  emptyText,
  overdue = false,
}: {
  debts: Debt[]
  emptyText: string
  overdue?: boolean
}) {
  if (debts.length === 0) {
    return <p className="muted">{emptyText}</p>
  }

  return (
    <ul className="attention-list">
      {debts.map((debt) => (
        <li key={debt.id} className="next-debt">
          <div>
            <p className={overdue ? 'next-debt-name overdue-flash' : 'next-debt-name'}>
              {debt.name}
            </p>
            <p className="muted">
              {debt.lender} · hạn {formatDate(debt.nextDueDate)}
            </p>
          </div>
          <p className="next-debt-amount">{formatVnd(debt.installmentAmount)}</p>
        </li>
      ))}
    </ul>
  )
}

export function Overview({ snapshot, plan }: Props) {
  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Tổng quan</p>
        <h1>Trợ Lý Tài Chính Cá Nhân Hoá</h1>
        <p className="lede">
          Nợ là số còn phải trả. Ba ô kia là tiền đang cầm, tách theo việc được
          phép dùng.
        </p>
      </header>

      <section className="metric-grid" aria-label="Bốn nhóm tiền">
        <article className="card metric-card">
          <p className="target-label">Tổng số nợ</p>
          <p className="target-value target-value--sm negative">
            {formatVnd(plan.totalDebt)}
          </p>
          <p className="footnote">Còn phải trả, lấy từ tab Nợ</p>
        </article>
        <article className="card metric-card">
          <p className="target-label">Tổng số trích lập trả nợ</p>
          <p className="target-value target-value--sm">
            {formatVnd(plan.debtReserve)}
          </p>
          <p className="footnote">Tiền để sẵn cho kỳ quá hạn, tháng này và tháng sau</p>
        </article>
        <article className="card metric-card">
          <p className="target-label">Tổng số mục tiêu</p>
          <p className="target-value target-value--sm">
            {formatVnd(plan.savings)}
          </p>
          <p className="footnote">Nhà, xe, dự phòng ốm đau</p>
        </article>
        <article className="card metric-card">
          <p className="target-label">Tổng số tiền lưu thông</p>
          <p className="target-value target-value--sm">
            {formatVnd(plan.circulating)}
          </p>
          <p className="footnote">Sinh hoạt và chi tiêu khác</p>
        </article>
      </section>

      {plan.inDebtMode && (
        <section className="banner" aria-live="polite">
          <strong>Chế độ trả nợ</strong>
          <p>
            Hôm nay cần kiếm {formatVnd(plan.needPerDay)}. Tháng này còn thiếu{' '}
            {formatVnd(plan.needPerMonth)} để đủ nợ, chi phí và mục tiêu còn lại.
          </p>
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h2>Dòng tiền tháng này</h2>
        </div>
        <dl className="stat-row">
          <div>
            <dt>Đã thu</dt>
            <dd className="positive">{formatVnd(plan.incomeThisMonth)}</dd>
          </div>
          <div>
            <dt>Đã chi</dt>
            <dd>{formatVnd(plan.expenseThisMonth)}</dd>
          </div>
          <div>
            <dt>Còn lại</dt>
            <dd className={plan.cashThisMonth >= 0 ? 'positive' : 'negative'}>
              {formatVnd(plan.cashThisMonth)}
            </dd>
          </div>
        </dl>
        <p className="footnote">
          Nghĩa vụ tháng: sinh hoạt {formatVnd(snapshot.monthlyLivingCost)} + trả
          nợ {formatVnd(plan.debtDueThisMonth)}.
        </p>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Nợ cần chú ý</h2>
          <span>
            {plan.overdueDebts.length +
              plan.dueThisMonth.length +
              plan.dueNextMonth.length}{' '}
            món
          </span>
        </div>

        <div className="attention-group">
          <p className="attention-label attention-label--alert">Quá hạn</p>
          <DebtRows
            debts={plan.overdueDebts}
            emptyText="Không có món quá hạn."
            overdue
          />
        </div>
        <div className="attention-group">
          <p className="attention-label">Đến hạn tháng này</p>
          <DebtRows
            debts={plan.dueThisMonth}
            emptyText="Không còn kỳ nào trong tháng này."
          />
        </div>
        <div className="attention-group">
          <p className="attention-label">Đến hạn tháng sau</p>
          <DebtRows
            debts={plan.dueNextMonth}
            emptyText="Không có kỳ nào tháng sau."
          />
        </div>
      </section>
    </div>
  )
}
