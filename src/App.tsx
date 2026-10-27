import { useEffect, useMemo, useState } from 'react'
import { demoSnapshot } from './data/demo'
import { markPeriodPaid, payOffEarly } from './lib/debt'
import { loadDebts, saveDebts } from './lib/debtStorage'
import { normalizeGoal } from './lib/goal'
import { loadGoals, saveGoals } from './lib/goalStorage'
import { loadTransactions, saveTransactions } from './lib/txStorage'
import { msUntilNextMidnight } from './lib/money'
import { buildPlan } from './lib/plan'
import { Overview } from './screens/Overview'
import { Debts } from './screens/Debts'
import { Income } from './screens/Income'
import { Expenses } from './screens/Expenses'
import { Savings } from './screens/Savings'
import { CashFlow } from './screens/CashFlow'
import { Goals } from './screens/Goals'
import { Info } from './screens/Info'
import './App.css'

type Tab =
  | 'overview'
  | 'debts'
  | 'income'
  | 'expenses'
  | 'savings'
  | 'cash'
  | 'goals'
  | 'info'

const tabs: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'debts', label: 'Nợ' },
  { id: 'income', label: 'Thu nhập' },
  { id: 'expenses', label: 'Chi phí' },
  { id: 'savings', label: 'Mục tiêu' },
  { id: 'cash', label: 'Dòng tiền' },
  { id: 'goals', label: 'Yêu cầu' },
  { id: 'info', label: 'Thông tin' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [debts, setDebts] = useState(loadDebts)
  const [transactions, setTransactions] = useState(loadTransactions)
  const [savingPots, setSavingPots] = useState(loadGoals)
  const [now, setNow] = useState(() => new Date())
  const snapshot = useMemo(
    () => ({
      ...demoSnapshot,
      debts,
      transactions,
      savingPots: savingPots.map(normalizeGoal),
    }),
    [debts, transactions, savingPots],
  )
  const plan = useMemo(() => buildPlan(snapshot, now), [snapshot, now])

  useEffect(() => {
    let timer = 0
    const tick = () => setNow(new Date())
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        tick()
        arm()
      }, msUntilNextMidnight())
    }
    arm()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick()
        arm()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  useEffect(() => {
    saveDebts(debts)
  }, [debts])

  useEffect(() => {
    saveTransactions(transactions)
  }, [transactions])

  useEffect(() => {
    saveGoals(savingPots)
  }, [savingPots])

  return (
    <div className="app-shell">
      <main className="app-main">
        {tab === 'overview' && <Overview snapshot={snapshot} plan={plan} />}
        {tab === 'debts' && (
          <Debts
            debts={debts}
            plan={plan}
            onAdd={(debt) => setDebts((current) => [debt, ...current])}
            onPayPeriod={(id) =>
              setDebts((current) =>
                current.map((item) =>
                  item.id === id ? markPeriodPaid(item) : item,
                ),
              )
            }
            onPayOffEarly={(id) =>
              setDebts((current) =>
                current.map((item) =>
                  item.id === id ? payOffEarly(item) : item,
                ),
              )
            }
          />
        )}
        {tab === 'income' && (
          <Income
            snapshot={snapshot}
            plan={plan}
            onAdd={(item) => setTransactions((current) => [item, ...current])}
          />
        )}
        {tab === 'expenses' && (
          <Expenses
            snapshot={snapshot}
            plan={plan}
            onAdd={(item) => setTransactions((current) => [item, ...current])}
          />
        )}
        {tab === 'savings' && (
          <Savings
            snapshot={snapshot}
            plan={plan}
            onAdd={(item) => setSavingPots((current) => [item, ...current])}
          />
        )}
        {tab === 'cash' && <CashFlow snapshot={snapshot} today={now} />}
        {tab === 'goals' && <Goals plan={plan} />}
        {tab === 'info' && <Info />}
      </main>
      <nav className="tabbar" aria-label="Điều hướng chính">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'tab tab--active' : 'tab'}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
