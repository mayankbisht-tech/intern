export default function OverviewSection({ summary, trendData, spendingData, insightData }) {
  let biggestBalance = 1
  let biggestSpend = 1

  for (const item of trendData) {
    if (item.balance > biggestBalance) {
      biggestBalance = item.balance
    }
  }

  for (const item of spendingData) {
    if (item.amount > biggestSpend) {
      biggestSpend = item.amount
    }
  }

  return (
    <div>
      <section className="hero-panel">
        <div>
          <p className="label-text">Overview</p>
          <h2>Personal finance snapshot</h2>
          <p className="subtle-text hero-copy">Balance, spending, and recent activity.</p>
        </div>

        <div className="hero-status">
          <p className="label-text">Role</p>
          <h3>{insightData.roleLabel}</h3>
        </div>
      </section>

      <section className="summary-grid">
        <div className="card summary-card">
          <p className="label-text">Total Balance</p>
          <h2>{summary.balanceLabel}</h2>
          <p className="subtle-text">Net amount after expenses</p>
        </div>
        <div className="card summary-card">
          <p className="label-text">Income</p>
          <h2>{summary.incomeLabel}</h2>
          <p className="subtle-text">Total incoming money</p>
        </div>
        <div className="card summary-card">
          <p className="label-text">Expenses</p>
          <h2>{summary.expensesLabel}</h2>
          <p className="subtle-text">Total outgoing money</p>
        </div>
      </section>

      <section className="main-grid">
        <div className="chart-grid">
          <div className="card">
            <div className="section-header">
              <div>
                <p className="label-text">Overview</p>
                <h3>Balance trend</h3>
              </div>
              <p className="subtle-text">Simple month wise view</p>
            </div>

            <div className="bar-list">
              {trendData.map((item) => (
                <div key={item.key}>
                  <div className="bar-copy">
                    <span>{item.label}</span>
                    <strong>{item.balanceLabel}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: getBarWidth(item.balance, biggestBalance) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <div>
                <p className="label-text">Spending</p>
                <h3>Category breakdown</h3>
              </div>
              <p className="subtle-text">Expense categories only</p>
            </div>

            <div className="bar-list">
              {spendingData.map((item) => (
                <div key={item.category}>
                  <div className="bar-copy">
                    <span>{item.category}</span>
                    <strong>{item.amountLabel}</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: getBarWidth(item.amount, biggestSpend) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="card insights-card">
          <div className="section-header">
            <div>
              <p className="label-text">Insights</p>
              <h3>Quick view</h3>
            </div>
          </div>

          <div className="insight-list">
            <div className="insight-block">
              <p className="label-text">Highest spending category</p>
              <h4>{insightData.topCategoryTitle}</h4>
              <p className="subtle-text">{insightData.topCategoryValue}</p>
            </div>

            <div className="insight-block">
              <p className="label-text">Monthly comparison</p>
              <h4>{insightData.monthTitle}</h4>
              <p className="subtle-text">{insightData.monthText}</p>
            </div>

            <div className="insight-block">
              <p className="label-text">Savings snapshot</p>
              <h4>{summary.balanceLabel}</h4>
              <p className="subtle-text">{insightData.balanceText}</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}

function getBarWidth(value, biggestValue) {
  return `${(value / biggestValue) * 100}%`
}
