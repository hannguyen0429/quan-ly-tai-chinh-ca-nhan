const vnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

export function formatVnd(amount: number): string {
  return vnd.format(amount)
}

export function formatCompactVnd(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000
    const text = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
    return `${text} tr`
  }
  return formatVnd(amount)
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatMonthTitle(date: Date): string {
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysLeftInMonth(today: Date): number {
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return Math.max(1, last - today.getDate() + 1)
}

export function msUntilNextMidnight(from = new Date()): number {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1)
  return Math.max(50, next.getTime() - from.getTime())
}

export function monthsLeftInYear(today: Date): number {
  return 12 - today.getMonth()
}
