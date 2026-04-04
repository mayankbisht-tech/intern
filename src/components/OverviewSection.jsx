export default function OverviewSection({ summary }) {
  return (
    <div>
      <section className="hero-panel">
        <div>
          <h2>Overview</h2>
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
    </div>
  )
}
