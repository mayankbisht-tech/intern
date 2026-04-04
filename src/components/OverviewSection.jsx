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
          <h2>Overview</h2>
        </div>

        <div className="hero-status">
          <h3>{insightData.roleLabel}</h3>
        </div>
      </section>

      <section className="summary-grid">
        <div className="card summary-card">
          <p className="label-text">Balance</p>
          <h2>{summary.balanceLabel}</h2>
        </div>
        <div className="card summary-card">
          <p className="label-text">Income</p>
          <h2>{summary.incomeLabel}</h2>
        </div>
        <div className="card summary-card">
          <p className="label-text">Expenses</p>
          <h2>{summary.expensesLabel}</h2>
        </div>
      </section>

      <section className="main-grid">
        <div className="chart-grid">
          <div className="card">
          <div className="section-header">
            <div>
              <h3>Balance trend</h3>
            </div>
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
              <h3>Spending</h3>
            </div>
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
              <h3>Insights</h3>
            </div>
          </div>

          <div className="insight-list">
            <div className="insight-block">
              <p className="label-text">Top category</p>
              <h4>{insightData.topCategoryTitle}</h4>
            </div>

            <div className="insight-block">
              <p className="label-text">Month change</p>
              <h4>{insightData.monthTitle}</h4>
            </div>

            <div className="insight-block">
              <p className="label-text">Snapshot</p>
              <h4>{summary.balanceLabel}</h4>
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
