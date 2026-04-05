export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatSignedAmount(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}${formatCurrency(amount)}`
}

export function getSummary(transactions) {
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

export function getTrendData(transactions) {
  const monthMap = {}

  for (const item of transactions) {
    const date = new Date(item.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`

    if (!monthMap[key]) {
      monthMap[key] = {
        key,
        label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
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

  return trendList
}

export function getSpendingData(transactions) {
  const categoryMap = {}

  for (const item of transactions) {
    if (item.type === 'expense') {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + item.amount
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

  return spendingList
}

export function getCategories(transactions) {
  const categoryList = []

  for (const item of transactions) {
    if (!categoryList.includes(item.category)) {
      categoryList.push(item.category)
    }
  }

  return categoryList.sort()
}

export function getInsightData(trendData, spendingData) {
  const topCategory = spendingData[0]
  const previousMonth = trendData[trendData.length - 2]
  const currentMonth = trendData[trendData.length - 1]

  let monthText = 'Not enough data'

  if (previousMonth && currentMonth) {
    const difference = currentMonth.balance - previousMonth.balance
    monthText = `${currentMonth.label}: ${formatCurrency(difference)}`
  }

  return {
    topCategoryTitle: topCategory ? topCategory.category : 'No expense data',
    monthTitle: currentMonth ? currentMonth.label : 'Not enough data',
    monthText,
  }
}

export function exportToCSV(transactions) {
  const headers = ['ID', 'Title', 'Amount', 'Category', 'Type', 'Date']
  const rows = transactions.map(txn => [
    txn.id,
    txn.title,
    txn.amount,
    txn.category,
    txn.type,
    txn.date
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'transactions.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(transactions) {
  const jsonContent = JSON.stringify(transactions, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'transactions.json')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
