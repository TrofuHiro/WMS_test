'use client'

import { useEffect, useState } from 'react'

export default function TransactionsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [suggestions, setSuggestions] = useState([])

  // =========================
  // 📦 FETCH
  // =========================
  const fetchData = async () => {
  setLoading(true)

  try {
    const params = new URLSearchParams()

    if (search) params.append('name', search)
    if (type) params.append('type', type)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    // ✅ pagination
    params.append('page', page)
    params.append('limit', 10)

    const res = await fetch(`/api/transactions?${params.toString()}`)
    const json = await res.json()

    setData(json.data || [])
    setTotalPages(json.pagination?.totalPages || 1)

  } catch (err) {
    console.error(err)
  }

  setLoading(false)
}

  // =========================
  // 🔍 AUTOCOMPLETE
  // =========================
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search) {
        setSuggestions([])
        return
      }

      const res = await fetch(`/api/inventory?name=${search}`)
      const json = await res.json()
      setSuggestions(json.data || [])
    }, 300)

    return () => clearTimeout(delay)
  }, [search])

  const handleSelect = (item) => {
    setSearch(item.product.name)
    setSuggestions([])
    setTimeout(fetchData, 100)
  }

  useEffect(() => {
  fetchData()
}, [page])

  return (
    <div style={container}>
      <h1 style={title}>📑 Transactions</h1>

      {/* 🔍 SEARCH */}
      <div style={card}>
        <h3>🔍 Search</h3>

        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product..."
            style={input}
          />

          {suggestions.length > 0 && (
            <div style={dropdown}>
              {suggestions.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={dropdownItem}
                >
                  {item.product.name} ({item.location.code})
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={input}
        >
          <option value="">All</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

        <button onClick={() => {
  setPage(1)
  fetchData()
}}>
  Search
</button>
      </div>

      {/* 📅 DATE */}
      <div style={card}>
        <h3>📅 Filter by Date</h3>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={input}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={input}
        />

        <button style={btn} onClick={fetchData}>
          Apply
        </button>
      </div>

      {/* 📊 TABLE */}
      <div style={card}>
        <h3>📊 Result</h3>

        {loading && <p>Loading...</p>}

        {!loading && data.length === 0 && <p>No data</p>}

        {!loading && data.length > 0 && (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Product</th>
                <th style={th}>Type</th>
                <th style={th}>Qty</th>
                <th style={th}>Date</th>
              </tr>
            </thead>

            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={td}>{item.product.name}</td>

                  <td style={{
                    ...td,
                    color: item.type === 'OUT' ? 'red' : 'green',
                    fontWeight: 600
                  }}>
                    {item.type}
                  </td>

                  <td style={td}>{item.quantity}</td>

                  <td style={td}>
                    {new Date(item.createdAt).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ marginTop: 20 }}>
  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    style={btn}
  >
    Prev
  </button>

  <span style={{ margin: '0 10px' }}>
    Page {page} / {totalPages}
  </span>

  <button
    disabled={page === totalPages}
    onClick={() => setPage(page + 1)}
    style={btn}
  >
    Next
  </button>
</div>
    </div>
  )
}

//
// 🎨 STYLE
//

const container = {
  padding: 30,
  background: '#f8fafc',
  minHeight: '100vh',
  color: '#000'
}

const title = {
  fontSize: 24,
  fontWeight: 600,
  marginBottom: 20
}

const card = {
  background: '#fff',
  padding: 20,
  borderRadius: 10,
  marginBottom: 20,
  border: '1px solid #e5e7eb'
}

const input = {
  padding: 8,
  marginRight: 10,
  marginBottom: 10,
  border: '1px solid #ccc',
  borderRadius: 6,
  color: '#000'
}

const btn = {
  padding: '8px 14px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer'
}

const dropdown = {
  position: 'absolute',
  background: '#fff',
  border: '1px solid #ccc',
  width: 250,
  zIndex: 10
}

const dropdownItem = {
  padding: 8,
  cursor: 'pointer'
}

const table = {
  width: '100%',
  borderCollapse: 'collapse'
}

const th = {
  padding: 10,
  borderBottom: '1px solid #ddd',
  textAlign: 'left'
}

const td = {
  padding: 10,
  borderBottom: '1px solid #eee'
}