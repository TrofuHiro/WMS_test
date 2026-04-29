'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [data, setData] = useState([])
  const [chartData, setChartData] = useState([])

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [alerts, setAlerts] = useState([])

  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // =========================
  // 📦 FETCH INVENTORY
  // =========================
  const fetchData = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (search) params.append('name', search)
    if (location) params.append('locationCode', location)

    const res = await fetch(`/api/inventory?${params.toString()}`)
    const json = await res.json()

    setData(json.data || [])
    setLoading(false)
  }

  // =========================
  // 📊 FETCH CHART
  // =========================
  const fetchChart = async () => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const res = await fetch(`/api/transactions/summary?${params.toString()}`)
    const json = await res.json()

    const formatted = (json.data || []).map(i => ({
      type: i.type,
      quantity: i._sum.quantity || 0
    }))

    setChartData(formatted)
  }

  // =========================
  // 🤖 AI FUNCTION
  // =========================
  const handleAI = async () => {
    if (!message.trim()) return

    setAiLoading(true)

    try {
      const res = await fetch('/api/ai-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (!res.ok) {
        alert('❌ AI error')
        return
      }

      await res.json()

      alert('✅ เพิ่มสินค้าเรียบร้อย')
      setMessage('')
      fetchData()
      fetchChart()

    } catch (err) {
      console.error(err)
      alert('❌ Network error')
    }

    setAiLoading(false)
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

  const handleSelectProduct = (item) => {
    setSelectedProduct(item)
    setSearch(item.product.name)
    setLocation(item.location.code)
    setSuggestions([])

    setTimeout(fetchData, 100)
  }

  // =========================
  // 🚨 ALERT
  // =========================
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/inventory')
      const json = await res.json()

      const low = json.data.filter(i => i.quantity < 5)
      setAlerts(low)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchData()
    fetchChart()
  }, [])

  return (
    <div style={container}>
      <h1 style={title}>📦 WMS Dashboard</h1>

      {/* 🚨 ALERT */}
      {alerts.length > 0 && (
        <div style={card}>
          <b>⚠️ Low Stock</b>
          {alerts.map(i => (
            <div key={i.id}>
              {i.product.name} ({i.location.code}) เหลือ {i.quantity}
            </div>
          ))}
        </div>
      )}

      {/* 🤖 AI */}
      <div style={card}>
        <h3>🤖 Input</h3>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="รับสินค้า iPhone 15 จำนวน 10 ที่ A1"
          style={input}
        />
        <button style={btn} onClick={handleAI}>
          {aiLoading ? 'Loading...' : 'Send'}
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <div style={card}>
        <h3>🔍 Search</h3>

        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Product"
            style={input}
          />

          {suggestions.length > 0 && (
            <div style={dropdown}>
              {suggestions.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  style={dropdownItem}
                >
                  {item.product.name} ({item.location.code})
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          style={input}
        />

        <button style={btn} onClick={fetchData}>
          Search
        </button>
      </div>

      {/* 📊 CHART */}
      <div style={card}>
        <h3>📊 Transactions</h3>

        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: 10 }} />
        <button style={btn} onClick={fetchChart}>Apply</button>

        <div style={{ marginTop: 20 }}>
          {chartData.length > 0 ? (
            <BarChart width={500} height={250} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#3b82f6" />
            </BarChart>
          ) : (
            <p>No data</p>
          )}
        </div>
      </div>

      {/* 📦 TABLE */}
      <div style={card}>
        <h3>📦 Inventory</h3>

        {loading && <p>Loading...</p>}

        {!loading && (
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Product</th>
                <th style={th}>Location</th>
                <th style={th}>Quantity</th>
              </tr>
            </thead>

            <tbody>
              {data.map(i => (
                <tr key={i.id}>
                  <td style={td}>{i.product.name}</td>
                  <td style={td}>{i.location.code}</td>
                  <td style={{
                    ...td,
                    color: i.quantity < 5 ? 'red' : '#000'
                  }}>
                    {i.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// 🎨 STYLE
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
  marginTop: 10,
  marginRight: 10,
  border: '1px solid #ccc',
  borderRadius: 6,
  color: '#000'
}

const btn = {
  padding: '8px 14px',
  marginLeft: 5 ,
  background: '#3b82f6',
  color: '#fff',
  border: '1px solid #ccc',
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