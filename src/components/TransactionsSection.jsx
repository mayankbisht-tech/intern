import { useState } from 'react'

const defaultFilters = {
  search: '',
  category: 'all',
  type: 'all',
  sortBy: 'date-desc',
}

export default function TransactionsSection({ transactions, formatDate, formatSignedAmount }) {
  const [filters, setFilters] = useState(defaultFilters)

  const categories = getCategories(transactions)
  const filteredTransactions = getFilteredTransactions(transactions, filters)

  return (
    <section className="card section-block">
      <div className="section-header">
        <div>
          <h3>Transactions</h3>
        </div>
        <p className="subtle-text">{filteredTransactions.length} items</p>
      </div>

      <div className="filters-grid">
        <div className="field-group">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search"
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
        </div>

        <div className="field-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
          >
            <option value="all">All</option>
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
            onChange={(event) => setFilters({ ...filters, type: event.target.value })}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={filters.sortBy}
            onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}
          >
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">High</option>
            <option value="amount-asc">Low</option>
          </select>
        </div>

        <div className="field-group button-field">
          <button className="secondary-button" type="button" onClick={() => setFilters(defaultFilters)}>
            Reset
          </button>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <h4>No results</h4>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
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
