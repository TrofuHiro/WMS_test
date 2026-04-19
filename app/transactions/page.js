'use client'

import { useEffect, useState } from 'react'

export default function TransactionPage() {
  const [data, setData] = useState([])
  const [type, setType] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (search) params.append('name', search)

    const res = await fetch(`/api/transactions?${params.toString()}`)
    const json = await res.json()

    setData(json.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>📜 Transaction History</h1>

      {/* 🔍 Filter */}
      <div style={{ marginBottom: 20 }}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button onClick={fetchData} style={{ marginLeft: 10 }}>
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Table */}
      {!loading && data.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Type</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td style={{ color: item.type === 'IN' ? 'green' : 'red' }}>
                  {item.type}
                </td>
                <td>{item.product.name}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && data.length === 0 && <p>No data found</p>}
    </div>
  )
}