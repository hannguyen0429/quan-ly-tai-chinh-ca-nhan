import { useMemo, useState, type FormEvent } from 'react'
import { createTransaction, txCycleOptions } from '../lib/transaction'
import { formatVnd } from '../lib/money'
import type { Transaction, TxCycle, TxKind } from '../types'

type Props = {
  type: 'in' | 'out'
  onConfirm: (item: Transaction) => void
  onCancel: () => void
}

type FormState = {
  source: string
  amount: string
  date: string
  kind: TxKind
  cycleUnit: TxCycle
}

const emptyForm: FormState = {
  source: '',
  amount: '',
  date: '',
  kind: 'once',
  cycleUnit: 'month',
}

export function MoneyEntryForm({ type, onConfirm, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')
  const isIncome = type === 'in'

  const amount = Number(form.amount)
  const preview = useMemo(() => {
    if (!Number.isFinite(amount) || amount <= 0) return 0
    return amount
  }, [amount])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.source.trim()) {
      setError(isIncome ? 'Nhập nguồn thu.' : 'Nhập lý do chi.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Số tiền phải lớn hơn 0.')
      return
    }
    if (!form.date) {
      setError(isIncome ? 'Chọn ngày nhận tiền.' : 'Chọn hạn phải chi.')
      return
    }

    onConfirm(
      createTransaction({
        type,
        source: form.source,
        amount,
        date: form.date,
        kind: form.kind,
        cycleUnit: form.cycleUnit,
      }),
    )
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-head">
        <h2>{isIncome ? 'Thêm thu nhập' : 'Thêm chi phí'}</h2>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>{isIncome ? 'Nguồn thu' : 'Lý do chi'}</span>
          <input
            type="text"
            value={form.source}
            onChange={(event) => update('source', event.target.value)}
            placeholder={isIncome ? 'Lương, freelance...' : 'Ăn uống, điện nước...'}
          />
        </label>
        <label className="field">
          <span>Số tiền</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={form.amount}
            onChange={(event) => update('amount', event.target.value)}
            placeholder="1500000"
          />
        </label>
        <label className="field">
          <span>{isIncome ? 'Ngày nhận tiền' : 'Hạn phải chi'}</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => update('date', event.target.value)}
          />
        </label>
        <label className="field">
          <span>{isIncome ? 'Loại thu' : 'Loại chi'}</span>
          <select
            value={form.kind}
            onChange={(event) => update('kind', event.target.value as TxKind)}
          >
            <option value="once">1 lần</option>
            <option value="recurring">
              {isIncome ? 'Thu cố định' : 'Chi cố định'}
            </option>
          </select>
        </label>
        <label className="field">
          <span>Chu kỳ thu/chi</span>
          <select
            value={form.kind === 'once' ? 'month' : form.cycleUnit}
            disabled={form.kind === 'once'}
            onChange={(event) =>
              update('cycleUnit', event.target.value as TxCycle)
            }
          >
            {form.kind === 'once' ? (
              <option value="month">1 kỳ</option>
            ) : (
              txCycleOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))
            )}
          </select>
        </label>
      </div>
      <p className="footnote">
        Số tiền: {preview > 0 ? formatVnd(preview) : '—'}
        {form.kind === 'once' ? ' · 1 kỳ' : ''}
      </p>
      {error ? <p className="alert">{error}</p> : null}
      <div className="debt-actions">
        <button type="submit" className="secondary-btn">
          Xác nhận
        </button>
        <button type="button" className="ghost-btn" onClick={onCancel}>
          Huỷ
        </button>
      </div>
    </form>
  )
}
