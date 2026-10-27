import { useMemo, useState, type FormEvent } from 'react'
import { createGoal, goalKindOptions } from '../lib/goal'
import { formatVnd } from '../lib/money'
import type { GoalKind, SavingPot } from '../types'

type Props = {
  onConfirm: (item: SavingPot) => void
  onCancel: () => void
}

type FormState = {
  name: string
  months: string
  targetAmount: string
  setAsideDay: string
  kind: GoalKind
}

const emptyForm: FormState = {
  name: '',
  months: '12',
  targetAmount: '',
  setAsideDay: '15',
  kind: 'home',
}

export function GoalForm({ onConfirm, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')

  const targetAmount = Number(form.targetAmount)
  const months = Math.floor(Number(form.months))
  const setAsideDay = Math.floor(Number(form.setAsideDay))
  const preview = useMemo(() => {
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) return 0
    return targetAmount
  }, [targetAmount])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Nhập tên mục tiêu.')
      return
    }
    if (!Number.isFinite(months) || months < 1) {
      setError('Thời hạn phải từ 1 tháng trở lên.')
      return
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('Số tiền mục tiêu phải lớn hơn 0.')
      return
    }
    if (!Number.isFinite(setAsideDay) || setAsideDay < 1 || setAsideDay > 31) {
      setError('Ngày trích lập từ 1 đến 31 hàng tháng.')
      return
    }

    onConfirm(
      createGoal({
        name: form.name,
        months,
        targetAmount,
        setAsideDay,
        kind: form.kind,
      }),
    )
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-head">
        <h2>Thêm mục tiêu</h2>
      </div>
      <div className="form-grid">
        <label className="field">
          <span>Tên mục tiêu</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Mua nhà, quỹ xe..."
          />
        </label>
        <label className="field">
          <span>Thời hạn (tháng)</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={form.months}
            onChange={(event) => update('months', event.target.value)}
            placeholder="12"
          />
        </label>
        <label className="field">
          <span>Số tiền mục tiêu</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={form.targetAmount}
            onChange={(event) => update('targetAmount', event.target.value)}
            placeholder="50000000"
          />
        </label>
        <label className="field">
          <span>Ngày trích lập hàng tháng</span>
          <input
            type="number"
            min={1}
            max={31}
            inputMode="numeric"
            value={form.setAsideDay}
            onChange={(event) => update('setAsideDay', event.target.value)}
            placeholder="15"
          />
        </label>
        <label className="field">
          <span>Loại hình</span>
          <select
            value={form.kind}
            onChange={(event) => update('kind', event.target.value as GoalKind)}
          >
            {goalKindOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="footnote">
        Số tiền: {preview > 0 ? formatVnd(preview) : '—'}
        {months >= 1 ? ` · ${months} tháng` : ''}
        {setAsideDay >= 1 && setAsideDay <= 31
          ? ` · trích lập ngày ${setAsideDay} hàng tháng`
          : ''}
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
