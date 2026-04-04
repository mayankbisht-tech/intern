import { useEffect, useState } from 'react'

const emptyForm = {
  title: '',
  amount: '',
  category: '',
  type: 'expense',
  date: '',
}

export default function TransactionModal({ isOpen, categories, initialValues, onClose, onSave }) {
  const [formValues, setFormValues] = useState(emptyForm)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (initialValues) {
      setFormValues({
        ...initialValues,
        amount: String(initialValues.amount),
      })
      return
    }

    setFormValues({
      title: '',
      amount: '',
      category: categories[0] || 'General',
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
    })
  }, [isOpen, initialValues, categories])

  if (!isOpen) {
    return null
  }

  function handleChange(key, value) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSave({
      ...formValues,
      amount: Number(formValues.amount),
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="section-header">
          <div>
            <h3>{initialValues ? 'Edit' : 'Add'}</h3>
          </div>
          <button className="text-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              required
              type="text"
              value={formValues.title}
              onChange={(event) => handleChange('title', event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              required
              min="1"
              type="number"
              value={formValues.amount}
              onChange={(event) => handleChange('amount', event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              required
              list="category-list"
              value={formValues.category}
              onChange={(event) => handleChange('category', event.target.value)}
            />
            <datalist id="category-list">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <div className="field-group">
            <label htmlFor="type">Type</label>
            <select id="type" value={formValues.type} onChange={(event) => handleChange('type', event.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="field-group full-width">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              required
              type="date"
              value={formValues.date}
              onChange={(event) => handleChange('date', event.target.value)}
            />
          </div>

          <div className="modal-actions full-width">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" type="submit">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
