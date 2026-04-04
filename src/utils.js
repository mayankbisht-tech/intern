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

export function getCategories(transactions) {
  const categoryList = []

  for (const item of transactions) {
    if (!categoryList.includes(item.category)) {
      categoryList.push(item.category)
    }
  }

  return categoryList.sort()
}
