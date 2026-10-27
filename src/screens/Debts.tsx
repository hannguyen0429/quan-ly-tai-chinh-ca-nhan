import { useMemo, useState, type FormEvent } from 'react'
import type { MoneyPlan } from '../lib/plan'
import {
  createDebt,
  daysUntilDue,
  installmentAmount,
  periodUnitLabel,
  periodUnitOptions,
} from '../lib/debt'
import { formatDate, formatVnd } from '../lib/money'
import type { Debt, PayMode, PeriodUnit } from '../types'

type Props = {
  debts: Debt[]
  plan: MoneyPlan
  onAdd: (debt: Debt) => void
  onPayPeriod: (id: string) => void
  onPayOffEarly: (id: string) => void
}

type FormState = {
  name: string
  lender: string
  amount: string
  payMode: PayMode
  periodCount: string
  periodUnit: PeriodUnit
  dueDate: string
}

const emptyForm: FormState = {
  name: '',
  lender: '',
  amount: '',
  payMode: 'installment',
  periodCount: '6',
  periodUnit: 'month',
  dueDate: '',
}

function statusLabel(debt: Debt, overdueIds: Set<string>): string {
  if (debt.remainingInstallments <= 0) return 'Đã trả xong'
  if (overdueIds.has(debt.id)) return 'Quá hạn'
  return 'Sắp đến hạn'
}

function dueCountdown(debt: Debt): string {
  if (debt.remainingInstallments <= 0) return 'Không còn hạn'
  const days = daysUntilDue(debt.nextDueDate)
  if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`
  if (days === 0) return 'Hạn hôm nay'
  return `Còn ${days} ngày`
}

export function Debts({ debts, plan, onAdd, onPayPeriod, onPayOffEarly }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const overdueIds = new Set(plan.overdueDebts.map((d) => d.id))

  const periods =
    form.payMode === 'once' ? 1 : Math.max(1, Number(form.periodCount) || 0)
  const total = Number(form.amount)
  const perPeriod = useMemo(() => {
    if (!Number.isFinite(total) || total <= 0 || periods < 1) return 0
    return installmentAmount(total, periods)
  }, [total, periods])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const amount = Number(form.amount)
    const periodCount =
      form.payMode === 'once' ? 1 : Math.floor(Number(form.periodCount))
    if (!form.name.trim() || !form.lender.trim()) {
      setError('Nhập tên khoản nợ và nợ ai.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Số tiền phải lớn hơn 0.')
      return
    }
    if (form.payMode === 'installment' && periodCount < 2) {
      setError('Trả góp cần từ 2 kỳ trở lên.')
      return
    }
    if (!form.dueDate) {
      setError('Chọn hạn phải trả.')
      return
    }

    onAdd(
      createDebt({
        name: form.name,
        lender: form.lender,
        totalAmount: amount,
        payMode: form.payMode,
        periodCount,
        periodUnit: form.periodUnit,
        dueDate: form.dueDate,
      }),
    )
    setForm(emptyForm)
    setError('')
    setOpen(false)
  }

  function handleCancel() {
    setForm(emptyForm)
    setError('')
    setOpen(false)
  }

  return (
    <div className="screen">
      <header className="topbar">
        <p className="eyebrow">Nợ</p>
        <h1>Từng món, từng kỳ</h1>
        <p className="lede">
          Tổng còn {formatVnd(plan.totalDebt)}. Tháng này cần trả{' '}
          {formatVnd(plan.debtDueThisMonth)}.
        </p>
      </header>

      <ul className="debt-list">
        {debts.map((debt) => (
          <li key={debt.id} className="card debt-card">
            <div className="card-head">
              <h2>{debt.name}</h2>
              <span
                className={
                  overdueIds.has(debt.id) ? 'pill pill--alert' : 'pill'
                }
              >
                {statusLabel(debt, overdueIds)}
              </span>
            </div>
            <p className="muted">Nợ {debt.lender}</p>
            <p
              className={
                overdueIds.has(debt.id) ? 'countdown overdue-flash' : 'countdown'
              }
            >
              Còn {debt.remainingInstallments}/{debt.totalInstallments} kỳ · Hạn
              kế tiếp {formatDate(debt.nextDueDate)} · {dueCountdown(debt)}
            </p>
            <dl className="debt-facts">
              <div>
                <dt>Tổng nợ</dt>
                <dd>{formatVnd(debt.totalAmount)}</dd>
              </div>
              <div>
                <dt>Còn nợ</dt>
                <dd>{formatVnd(debt.remaining)}</dd>
              </div>
              <div>
                <dt>Mỗi kỳ</dt>
                <dd>{formatVnd(debt.installmentAmount)}</dd>
              </div>
              <div>
                <dt>Cách trả</dt>
                <dd>
                  {debt.payMode === 'once'
                    ? '1 lần'
                    : periodUnitLabel(debt.periodUnit)}
                </dd>
              </div>
            </dl>
            {debt.remainingInstallments > 0 && (
              <div className="debt-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => onPayPeriod(debt.id)}
                >
                  Đã thanh toán kỳ trong tháng
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => onPayOffEarly(debt.id)}
                >
                  Trả nợ trước hạn
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {open ? (
      <form className="card" onSubmit={handleSubmit}>
        <div className="card-head">
          <h2>Thêm khoản nợ</h2>
        </div>
        <div className="form-grid">
          <label className="field">
            <span>Tên khoản nợ</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              placeholder="Thẻ tín dụng"
            />
          </label>
          <label className="field">
            <span>Nợ ai</span>
            <input
              type="text"
              value={form.lender}
              onChange={(event) => update('lender', event.target.value)}
              placeholder="Vietcombank / bạn An"
            />
          </label>
          <label className="field">
            <span>Số tiền (tổng nợ)</span>
            <input
              type="number"
              min={1}
              inputMode="numeric"
              value={form.amount}
              onChange={(event) => update('amount', event.target.value)}
              placeholder="18000000"
            />
          </label>
          <label className="field">
            <span>Cách trả</span>
            <select
              value={form.payMode}
              onChange={(event) => {
                const payMode = event.target.value as PayMode
                setForm((current) => ({
                  ...current,
                  payMode,
                  periodCount:
                    payMode === 'once'
                      ? '1'
                      : Number(current.periodCount) < 2
                        ? '2'
                        : current.periodCount,
                }))
                setError('')
              }}
            >
              <option value="once">Trả 1 lần</option>
              <option value="installment">Trả góp nhiều kỳ</option>
            </select>
          </label>
          <label className="field">
            <span>Số kỳ trả</span>
            <input
              type="number"
              min={form.payMode === 'once' ? 1 : 2}
              inputMode="numeric"
              value={form.payMode === 'once' ? '1' : form.periodCount}
              disabled={form.payMode === 'once'}
              onChange={(event) => update('periodCount', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Đơn vị 1 kỳ</span>
            <select
              value={form.periodUnit}
              onChange={(event) =>
                update('periodUnit', event.target.value as PeriodUnit)
              }
              disabled={form.payMode === 'once'}
            >
              {periodUnitOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Hạn phải trả</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
            />
          </label>
        </div>
        <p className="footnote">
          Số tiền mỗi kỳ:{' '}
          {perPeriod > 0 ? formatVnd(perPeriod) : '—'}
          {form.payMode === 'once'
            ? ' (bằng tổng nợ vì trả 1 lần)'
            : periods > 1
              ? ' (tổng nợ chia số kỳ)'
              : ''}
        </p>
        {error ? <p className="alert">{error}</p> : null}
        <div className="debt-actions">
          <button type="submit" className="secondary-btn">
            Xác nhận
          </button>
          <button type="button" className="ghost-btn" onClick={handleCancel}>
            Huỷ
          </button>
        </div>
      </form>
      ) : (
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setOpen(true)}
        >
          Thêm khoản nợ
        </button>
      )}
    </div>
  )
}
