import { buildMonthFlow } from '../lib/cashflow'
import { formatCompactVnd, formatVnd } from '../lib/money'
import type { FinanceSnapshot } from '../types'

type Props = {
  snapshot: FinanceSnapshot
  today?: Date
}

const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function signClass(amount: number): string {
  if (amount > 0) return 'positive'
  if (amount < 0) return 'negative'
  return ''
}

function dayClass(running: number, isToday: boolean, isForecast: boolean): string {
  const tone =
    running > 0 ? 'flow-day--pos' : running < 0 ? 'flow-day--neg' : 'flow-day--zero'
  const today = isToday ? ' flow-day--today' : ''
  const forecast = isForecast ? ' flow-day--forecast' : ''
  return `flow-day ${tone}${today}${forecast}`
}

export function CashFlow({ snapshot, today }: Props) {
  const flow = buildMonthFlow(snapshot, today)

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Dòng tiền</p>
        <h1>Thu trừ chi</h1>
        <p className="lede">
          Tháng theo ngày mở app. Số dư mỗi ngày cộng dồn thu, chi, nợ và mục
          tiêu — gồm cả ngày chưa tới.
        </p>
      </header>

      <section className="card">
        <div className="card-head">
          <h2>{flow.label}</h2>
        </div>
        <dl className="stat-row flow-stats">
          <div>
            <dt>Thu</dt>
            <dd className="positive">{formatVnd(flow.income)}</dd>
          </div>
          <div>
            <dt>Chi</dt>
            <dd className="negative">{formatVnd(flow.expense)}</dd>
          </div>
          <div>
            <dt>Nợ</dt>
            <dd className="negative">{formatVnd(flow.debt)}</dd>
          </div>
          <div>
            <dt>Mục tiêu</dt>
            <dd className="negative">{formatVnd(flow.goal)}</dd>
          </div>
          <div>
            <dt>Còn lại</dt>
            <dd className={signClass(flow.remaining)}>{formatVnd(flow.remaining)}</dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Theo ngày</h2>
        </div>
        <div className="flow-cal" role="grid" aria-label={`Lịch dòng tiền ${flow.label}`}>
          {weekdays.map((label) => (
            <div key={label} className="flow-cal-head" role="columnheader">
              {label}
            </div>
          ))}
          {Array.from({ length: flow.weekdayPad }, (_, index) => (
            <div key={`pad-${index}`} className="flow-day flow-day--pad" />
          ))}
          {flow.days.map((row) => (
            <div
              key={row.date}
              className={dayClass(row.running, row.isToday, row.isForecast)}
              role="gridcell"
              title={`${row.day}/${flow.label}: ${formatVnd(row.running)}`}
            >
              <span className="flow-day-num">{row.day}</span>
              <span className="flow-day-amt">{formatCompactVnd(row.running)}</span>
            </div>
          ))}
        </div>
        <p className="footnote">
          Xanh là số dư dương, đỏ là âm. Ngày viền đứt là dự báo. Mục tiêu trừ
          đúng ngày trích lập hàng tháng (tháng ngắn thì lấy ngày cuối tháng).
        </p>
      </section>
    </div>
  )
}
