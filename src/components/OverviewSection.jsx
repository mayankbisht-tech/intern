export default function OverviewSection({ summary, trendData, spendingData, insightData }) {
  return (
    <div>
      <section className="hero-panel">
        <div>
          <h2>Overview</h2>
          <p className="hero-copy">Track your financial activity, view summaries, and manage transactions.</p>
        </div>

        <div className="hero-status">
          <h3>Summary</h3>
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
              <p className="subtle-text">{insightData.monthText}</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}
