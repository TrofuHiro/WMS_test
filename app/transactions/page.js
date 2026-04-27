'use client'

import { useEffect, useState } from 'react'

export default function TransactionsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 🔍 autocomplete
  const [suggestions, setSuggestions] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  // =========================
  // 📦 FETCH TRANSACTIONS
  // =========================
  const fetchData = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (search) params.append('name', search)
      if (type) params.append('type', type)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      console.log('QUERY:', params.toString())

      const res = await fetch(`/api/transactions?${params.toString()}`)

      if (!res.ok) {
        console.error(await res.text())
        setLoading(false)
        return
      }

      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  // =========================
  // 🔍 AUTOCOMPLETE
  // =========================
  useEffect(() => {
    const fetchSuggest = async () => {
      if (!search) {
        setSuggestions([])
        return
      }

      try {
        const res = await fetch(`/api/inventory?name=${search}`)
        const json = await res.json()
        setSuggestions(json.data || [])
      } catch (err) {
        console.error(err)
      }
    }

    fetchSuggest()
  }, [search])

  const handleSelectProduct = (item) => {
    setSelectedProduct(item)
    setSearch(item.product.name)
    setSuggestions([])

    // 🔥 auto search
    setTimeout(fetchData, 100)
  }

  // =========================
  // 📅 QUICK DATE (UX ดีขึ้น)
  // =========================
  const setToday = () => {
    const today = new Date().toISOString().slice(0, 10)
    setStartDate(today)
    setEndDate(today)
  }

  const setLast7Days = () => {
    const today = new Date()
    const past = new Date()
    past.setDate(today.getDate() - 7)

    setStartDate(past.toISOString().slice(0, 10))
    setEndDate(today.toISOString().slice(0, 10))
  }

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>📑 Transactions</h1>

      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
        />

        {/* autocomplete */}
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            background: '#fff',
            border: '1px solid #ccc',
            width: 300,
            zIndex: 10
          }}>
            {suggestions.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectProduct(item)}
                style={{ padding: 5, cursor: 'pointer' }}
              >
                {item.product.name} ({item.location.code})
              </div>
            ))}
          </div>
        )}

        {/* type filter */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">All</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

        <button onClick={fetchData} style={{ marginLeft: 10 }}>
          Search
        </button>
      </div>

      {/* 📅 DATE FILTER */}
      <div style={{ marginBottom: 20 }}>
        <h3>📅 Filter by Date</h3>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button onClick={fetchData} style={{ marginLeft: 10 }}>
          Apply
        </button>

        {/* 🔥 Quick filter */}
        <button onClick={setToday} style={{ marginLeft: 10 }}>
          Today
        </button>

        <button onClick={setLast7Days} style={{ marginLeft: 10 }}>
          Last 7 Days
        </button>
      </div>

      {/* 📊 RESULT */}
      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && <p>No data found</p>}

      {!loading && data.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td style={{ color: item.type === 'OUT' ? 'red' : 'green' }}>
                  {item.type}
                </td>
                <td>{item.quantity}</td>
                <td>
                  {new Date(item.createdAt).toLocaleString('th-TH')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}