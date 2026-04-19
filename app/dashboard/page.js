'use client'

import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (search) params.append('name', search)
    if (location) params.append('locationCode', location)

    const url = `/api/inventory?${params.toString()}`

    const res = await fetch(url)
    const json = await res.json()

    setData(json.data || [])
    setLoading(false)
  }

  // โหลดครั้งแรก
  useEffect(() => {
    fetchData()
  }, [])

  // auto refresh
  useEffect(() => {
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [search, location])

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 WMS Dashboard</h1>

      {/* 🔍 Filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="Location (A1)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={fetchData}>Search</button>
      </div>

      {/* ⏳ Loading */}
      {loading && <p>Loading...</p>}

      {/* ❌ No Data */}
      {!loading && data.length === 0 && <p>No data found</p>}

      {/* 📊 Table */}
      {!loading && data.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Location</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td>{item.location.code}</td>
                <td style={{ color: item.quantity < 5 ? 'red' : '' }}>
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}