import { useEffect, useState } from 'react'
import './App.css'
import OverviewSection from './components/OverviewSection'
import TransactionsSection from './components/TransactionsSection'
import { dashboardTransactions } from './data/transactions'
import {
  formatDate,
  formatSignedAmount,
  getInsightData,
  getSpendingData,
  getSummary,
  getTrendData,
} from './utils'

export default function App() {
  const [role, setRole] = useLocalStorage('finance-role', 'viewer')
  const [transactions, setTransactions] = useLocalStorage('finance-transactions', dashboardTransactions)

  const summary = getSummary(transactions)
  const trendData = getTrendData(transactions)
  const spendingData = getSpendingData(transactions)
  const insightData = getInsightData(role, spendingData, trendData, summary.balance)

  function handleAddClick() {
    return
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Finance Dashboard</h1>
        </div>

        <div className="topbar-actions">
          <div className="field-group inline-field">
            <label htmlFor="role">Role</label>
            <select id="role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === 'admin' ? (
            <button className="primary-button" type="button" onClick={handleAddClick}>
              Add
            </button>
          ) : null}
        </div>
      </header>

      <main className="page-content">
        <OverviewSection
          summary={summary}
          trendData={trendData}
          spendingData={spendingData}
          insightData={insightData}
        />

        <TransactionsSection
          transactions={transactions}
          formatDate={formatDate}
          formatSignedAmount={formatSignedAmount}
        />
      </main>

    </div>
  )
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const savedValue = window.localStorage.getItem(key)

    if (!savedValue) {
      return initialValue
    }

    try {
      return JSON.parse(savedValue)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
