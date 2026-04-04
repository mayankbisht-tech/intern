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

export function getSpendingData(transactions) {
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

export function getInsightData(role, spendingData, trendData, balance) {
  const topCategory = spendingData[0]
  const previousMonth = trendData[trendData.length - 2]
  const currentMonth = trendData[trendData.length - 1]

  let monthText = 'Add more monthly data to unlock comparison insights'

  if (previousMonth && currentMonth) {
    const difference = currentMonth.balance - previousMonth.balance
    monthText = `${currentMonth.label} balance changed by ${formatCurrency(difference)} compared with ${previousMonth.label}`
  }

  return {
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
      balance >= 0
        ? 'Income is ahead of expenses in this sample'
        : 'Expenses are ahead of income in this sample',
  }
}
