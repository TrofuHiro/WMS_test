'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [chartData, setChartData] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  // 📦 fetch inventory
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

  // 📊 fetch chart
  const fetchChart = async () => {
    const res = await fetch('/api/transactions/summary')
    const json = await res.json()

    const formatted = (json.data || []).map(item => ({
      type: item.type,
      quantity: item._sum.quantity || 0
    }))

    setChartData(formatted)
  }

  // โหลดครั้งแรก
  useEffect(() => {
    fetchData()
    fetchChart()
  }, [])

  // auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
      fetchChart()
    }, 5000)

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

      {/* 📊 Chart */}
      <h2>📊 Transaction Summary</h2>
      {chartData.length > 0 ? (
        <BarChart width={500} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" />
        </BarChart>
      ) : (
        <p>No chart data</p>
      )}

      {/* ⏳ Loading */}
      {loading && <p>Loading...</p>}

      {/* ❌ No Data */}
      {!loading && data.length === 0 && <p>No data found</p>}

      {/* 📊 Table */}
      {!loading && data.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
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