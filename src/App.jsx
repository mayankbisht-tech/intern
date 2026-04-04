import { useEffect, useState } from 'react'
import './App.css'
import OverviewSection from './components/OverviewSection'
import { dashboardTransactions } from './data/transactions'

const defaultFilters = {
  search: '',
  category: 'all',
  type: 'all',
  sortBy: 'date-desc',
}

export default function App() {
  const [role, setRole] = useLocalStorage('finance-role', 'viewer')
  const [transactions, setTransactions] = useLocalStorage('finance-transactions', dashboardTransactions)
  const [filters, setFilters] = useState(defaultFilters)

  const categories = getCategories(transactions)
  const filteredTransactions = getFilteredTransactions(transactions, filters)
  const summary = getSummary(transactions)
  const trendData = getTrendData(transactions)
  const spendingData = getSpendingData(transactions)
  const topCategory = spendingData[0]
  const previousMonth = trendData[trendData.length - 2]
  const currentMonth = trendData[trendData.length - 1]

  let monthText = 'Add more monthly data to unlock comparison insights'

  if (previousMonth && currentMonth) {
    const difference = currentMonth.balance - previousMonth.balance
    monthText = `${currentMonth.label} balance changed by ${formatCurrency(difference)} compared with ${previousMonth.label}`
  }

  const insightData = {
    roleLabel: role === 'admin' ? 'Admin' : 'Viewer',
    roleText:
      role === 'admin'
        ? 'You can add or edit transactions.'
        : 'You can view data, search, sort, and filter.',
    topCategoryTitle: topCategory ? topCategory.category : 'No expense data',
    topCategoryValue: topCategory ? topCategory.amountLabel : 'Waiting for transactions',
    monthTitle: currentMonth ? currentMonth.label : 'Not enough data',
    monthText,
    balanceText:
      summary.balance >= 0
        ? 'Income is ahead of expenses in this sample'
        : 'Expenses are ahead of income in this sample',
  }

  function handleFilterChange(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleAddClick() {
    return
  }

  function handleEdit(transaction) {
    return
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="label-text">Zorvyn</p>
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

        <section className="card section-block">
          <div className="section-header">
            <div>
              <p className="label-text">Transactions</p>
              <h3>Recent activity</h3>
            </div>
            <p className="subtle-text">{filteredTransactions.length} matching records</p>
          </div>

          <div className="filters-grid">
            <div className="field-group">
              <label htmlFor="search">Search</label>
              <input
                id="search"
                type="text"
                placeholder="Search title or category"
                value={filters.search}
                onChange={(event) => handleFilterChange('search', event.target.value)}
              />
            </div>

            <div className="field-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={filters.category}
                onChange={(event) => handleFilterChange('category', event.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                value={filters.type}
                onChange={(event) => handleFilterChange('type', event.target.value)}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="sort">Sort</label>
              <select
                id="sort"
                value={filters.sortBy}
                onChange={(event) => handleFilterChange('sortBy', event.target.value)}
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
            </div>

            <div className="field-group button-field">
              <button
                className="secondary-button"
                type="button"
                onClick={() => setFilters(defaultFilters)}
              >
                Reset filters
              </button>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <h4>No transactions found</h4>
              <p className="subtle-text">Try changing the filters or search term.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{formatDate(item.date)}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`type-badge ${item.type}`}>{item.type}</span>
                      </td>
                      <td className={item.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                        {formatSignedAmount(item.amount, item.type)}
                      </td>
                      <td>
                        {role === 'admin' ? (
                          <button className="text-button" type="button" onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                        ) : (
                          <span className="subtle-text">Read only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatSignedAmount(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${formatCurrency(amount)}`
}

function getCategories(transactions) {
  const categoryList = []

  for (const item of transactions) {
    if (!categoryList.includes(item.category)) {
      categoryList.push(item.category)
    }
  }

  return categoryList.sort()
}

function getFilteredTransactions(transactions, filters) {
  const searchText = filters.search.trim().toLowerCase()
  const filteredList = []

  for (const item of transactions) {
    const matchesSearch =
      searchText === '' ||
      item.title.toLowerCase().includes(searchText) ||
      item.category.toLowerCase().includes(searchText)

    const matchesCategory = filters.category === 'all' || item.category === filters.category
    const matchesType = filters.type === 'all' || item.type === filters.type

    if (matchesSearch && matchesCategory && matchesType) {
      filteredList.push(item)
    }
  }

  filteredList.sort((a, b) => {
    if (filters.sortBy === 'amount-desc') {
      return b.amount - a.amount
    }

    if (filters.sortBy === 'amount-asc') {
      return a.amount - b.amount
    }

    if (filters.sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date)
    }

    return new Date(b.date) - new Date(a.date)
  })

  return filteredList
}

function getSummary(transactions) {
  let balance = 0
  let income = 0
  let expenses = 0

  for (const item of transactions) {
    if (item.type === 'income') {
      income += item.amount
      balance += item.amount
    } else {
      expenses += item.amount
      balance -= item.amount
    }
  }

  return {
    balance,
    income,
    expenses,
    balanceLabel: formatCurrency(balance),
    incomeLabel: formatCurrency(income),
    expensesLabel: formatCurrency(expenses),
  }
}

function getTrendData(transactions) {
  const monthMap = {}

  for (const item of transactions) {
    const date = new Date(item.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`

    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
        sortValue: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        income: 0,
        expenses: 0,
        balance: 0,
        balanceLabel: '',
      }
    }

    if (item.type === 'income') {
      monthMap[key].income += item.amount
    } else {
      monthMap[key].expenses += item.amount
    }
  }

  const trendList = Object.values(monthMap)

  for (const item of trendList) {
    item.balance = item.income - item.expenses
    item.balanceLabel = formatCurrency(item.balance)
  }

  trendList.sort((a, b) => a.sortValue - b.sortValue)

  return trendList
}

function getSpendingData(transactions) {
  const categoryMap = {}

  for (const item of transactions) {
    if (item.type === 'expense') {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = 0
      }

      categoryMap[item.category] += item.amount
    }
  }

  const spendingList = []

  for (const category in categoryMap) {
    spendingList.push({
      category,
      amount: categoryMap[category],
      amountLabel: formatCurrency(categoryMap[category]),
    })
  }

  spendingList.sort((a, b) => b.amount - a.amount)

  return spendingList
}
