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

  // 🤖 AI
  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  // 🔍 autocomplete
  const [suggestions, setSuggestions] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  // 📤 outbound
  const [outQty, setOutQty] = useState(1)

  // 🚨 alert
  const [alerts, setAlerts] = useState([])

  // =========================
  // 📦 FETCH INVENTORY (สำคัญ)
  // =========================
  const fetchData = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (search) params.append('name', search)
      if (location) params.append('locationCode', location)

      const res = await fetch(`/api/inventory?${params.toString()}`)
      if (!res.ok) return

      const json = await res.json()

      // ✅ ใช้เฉพาะข้อมูลที่ search มา
      setData(json.data || [])
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  // =========================
  // 📊 FETCH CHART
  // =========================
  
  const fetchChart = async () => {
  try {
    const params = new URLSearchParams()

    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const res = await fetch(`/api/transactions/summary?${params.toString()}`)
    if (!res.ok) return

    const json = await res.json()

    const formatted = (json.data || []).map(item => ({
      type: item.type,
      quantity: item._sum.quantity || 0
    }))

    setChartData(formatted)
  } catch (err) {
    console.error(err)
  }
}

  // =========================
  // 🤖 AI
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
        const text = await res.text()
        console.error(text)
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
    setLocation(item.location.code)
    setSuggestions([])

    // 🔥 auto search ทันที
    setTimeout(fetchData, 100)
  }

  // =========================
  // 📤 OUTBOUND
  // =========================
  const handleOutbound = async () => {
    if (!selectedProduct) return alert('เลือกสินค้าก่อน')

    if (outQty <= 0) return alert('จำนวนต้องมากกว่า 0')

    if (outQty > selectedProduct.quantity) {
      return alert('❌ จำนวนสินค้าไม่พอ')
    }

    try {
      const res = await fetch('/api/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.product.id,
          locationId: selectedProduct.location.id,
          quantity: Number(outQty)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || '❌ error')
        return
      }

      alert('✅ เบิกสินค้าเรียบร้อย')

      setSelectedProduct(null)
      fetchData()
      fetchChart()
    } catch (err) {
      console.error(err)
      alert('❌ error')
    }
  }

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    fetchData()
    fetchChart()
  }, [])

  // =========================
  // 🤖 AUTO MONITOR
  // =========================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/inventory')
        const json = await res.json()

        const lowStock = json.data.filter(i => i.quantity < 5)
        setAlerts(lowStock)
      } catch (err) {
        console.error(err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 WMS Dashboard</h1>

      {/* 🚨 ALERT */}
      {alerts.length > 0 && (
        <div style={{ background: '#ffe0e0', padding: 10, marginBottom: 20 }}>
          ⚠️ Low Stock:
          {alerts.map(i => (
            <div key={i.id}>
              {i.product.name} ({i.location.code}) เหลือ {i.quantity}
            </div>
          ))}
        </div>
      )}

      {/* 🤖 AI */}
      <div style={{ marginBottom: 20 }}>
        <h2>🤖 AI Input</h2>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="รับสินค้า iPhone 15 จำนวน 10 ที่ A1"
          style={{ width: 400, marginRight: 10 }}
        />

        <button onClick={handleAI} disabled={aiLoading}>
          {aiLoading ? 'Processing...' : 'Send'}
        </button>
      </div>

      {/* 🔍 SEARCH */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product..."
        />

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

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          style={{ marginLeft: 10 }}
        />

        <button onClick={fetchData}>Search</button>
      </div>

      {/* 📤 OUTBOUND */}
      <div style={{ marginBottom: 20 }}>
        <h3>📤 Outbound</h3>

        {selectedProduct && (
          <p>
            Selected: {selectedProduct.product.name} ({selectedProduct.location.code})
          </p>
        )}

        <input
          type="number"
          value={outQty}
          onChange={(e) => setOutQty(e.target.value)}
        />

        <button onClick={handleOutbound}>เอาสินค้าออก</button>
      </div>

      {/* 📊 CHART */}
      <h2>📊 Transaction Summary</h2>
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

  <button onClick={fetchChart} style={{ marginLeft: 10 }}>
    Apply
  </button>
</div>
      {chartData.length > 0 ? (
        <BarChart width={500} height={300} data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="type" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="quantity" />
</BarChart>
      ) : (
        <p>No chart data</p>
      )}

      {/* 📦 TABLE */}
      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && <p>No data found</p>}

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
            {data.map(item => (
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