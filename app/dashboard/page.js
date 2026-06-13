'use client'

import Link from 'next/link'
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
  const [inboundSuggestions, setInboundSuggestions] =
  useState([])
  const [locationSuggestions, setLocationSuggestions] =
  useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [alerts, setAlerts] = useState([])

  const [message, setMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [user, setUser] = useState(null)

  const [showInbound, setShowInbound] =
  useState(false)

const [showOutbound, setShowOutbound] =
  useState(false)


const [inboundForm, setInboundForm] =
  useState({
    name: '',
    quantity: '',
    locationCode: ''
  })

const [outboundForm, setOutboundForm] =
useState({
  productName: '',
  locationCode: '',
  quantity: ''
})
const [outboundProductSuggestions,
  setOutboundProductSuggestions] =
  useState([])

const [outboundLocationSuggestions,
  setOutboundLocationSuggestions] =
  useState([])

  const [stats, setStats] = useState({
  inbound: 0,
  outbound: 0
})
const [showProducts, setShowProducts] =
  useState(false)

const [products, setProducts] =
  useState([])
  const fetchProducts = async () => {

  try {

    const res =
      await fetch('/api/inventory?limit=1000')

    const json =
      await res.json()

    const names = new Set()

    const uniqueProducts = []

    ;(json.data || []).forEach(item => {

      if (
        item.product &&
        !names.has(item.product.name)
      ) {

        names.add(
          item.product.name
        )

        uniqueProducts.push(
          item.product
        )
      }

    })

    setProducts(
      uniqueProducts
    )

  } catch (err) {

    console.error(err)

  }

}
const [showAddUser, setShowAddUser] = useState(false)

const [name, setName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [role, setRole] = useState('STAFF')
const [showUsers, setShowUsers] =
  useState(false)

const [users, setUsers] =
  useState([])
  const fetchUsers = async () => {

  try {

    const token =
      localStorage.getItem('token')

    const res = await fetch(
      '/api/users',
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    const json =
      await res.json()

    setUsers(
      json.data || []
    )

  } catch (err) {

    console.error(err)

  }

}
  // =========================
  // 📦 FETCH INVENTORY
  // =========================
  const fetchData = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (search) params.append('name', search)
      if (location) params.append('locationCode', location)

      params.append('page', page)
      params.append('limit', 10)

      const res = await fetch(`/api/inventory?${params.toString()}`)
      const json = await res.json()

      setData(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)

    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  // 🔁 โหลดใหม่เมื่อ page เปลี่ยน
  useEffect(() => {
    fetchData()
  }, [page])

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

  const fetchStats = async () => {
  try {

    const inventoryRes =
      await fetch('/api/inventory?limit=1')

    const inventoryJson =
      await inventoryRes.json()

    const summaryRes =
      await fetch('/api/transactions/summary')

    const summaryJson =
      await summaryRes.json()

    const inbound =
      summaryJson.data?.find(
        x => x.type === 'IN'
      )?._sum?.quantity || 0

    const outbound =
      summaryJson.data?.find(
        x => x.type === 'OUT'
      )?._sum?.quantity || 0

    setStats({
      inbound,
      outbound
    })

  } catch (err) {
    console.error(err)
  }
}
const createUser = async () => {
  try {

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role
      })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    alert('User created')

    setShowAddUser(false)

    setName('')
    setEmail('')
    setPassword('')
    setRole('STAFF')

    fetchUsers()

  } catch (err) {
    console.error(err)
  }
}
const handleInbound = async () => {

  const token =
    localStorage.getItem('token')

  try {

    const res =
      await fetch('/api/inbound', {

        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify(
          inboundForm
        )
      })

    const data =
      await res.json()

    if (!res.ok) {
      return alert(data.error)
    }

    alert('✅ Inbound Success')

    setShowInbound(false)

    setInboundForm({
      name: '',
      quantity: '',
      locationCode: ''
    })

    fetchData()
    fetchChart()
    fetchStats()

  } catch (err) {
    console.error(err)
  }
}
const handleOutbound = async () => {

  const token =
    localStorage.getItem('token')

  try {

    const res =
      await fetch('/api/outbound', {

        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
  productName: outboundForm.productName,
  locationCode: outboundForm.locationCode,
  quantity: Number(outboundForm.quantity)
})
      })

    const data =
      await res.json()

    if (!res.ok) {
      return alert(data.error)
    }

    alert('✅ Outbound Success')

    setShowOutbound(false)

    setOutboundForm({
  productName: '',
  locationCode: '',
  quantity: ''
})

    fetchData()
    fetchChart()
    fetchStats()

  } catch (err) {
    console.error(err)
  }
}

  // =========================
  // 🔍 AUTOCOMPLETE
  // =========================
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search) return setSuggestions([])

      const res = await fetch(`/api/inventory?name=${search}&limit=5`)
      const json = await res.json()

      setSuggestions(json.data || [])
    }, 300)

    return () => clearTimeout(delay)
  }, [search])
  useEffect(() => {

  const delay = setTimeout(async () => {

    if (!inboundForm.name) {
      setInboundSuggestions([])
      return
    }

    try {

      const res = await fetch(
        `/api/inventory?name=${inboundForm.name}&limit=5`
      )

      const json = await res.json()

      const uniqueProducts = []

      const names = new Set()

      ;(json.data || []).forEach(item => {

        if (!names.has(item.product.name)) {

          names.add(item.product.name)

          uniqueProducts.push({
            id: item.product.id,
            name: item.product.name
          })
        }
      })

      setInboundSuggestions(uniqueProducts)

    } catch (err) {
      console.error(err)
    }

  }, 300)
  
  return () => clearTimeout(delay)

}, [inboundForm.name])
useEffect(() => {

  const delay = setTimeout(async () => {

    if (!outboundForm.productName) {
      setOutboundProductSuggestions([])
      return
    }

    try {

      const res = await fetch(
        `/api/inventory?name=${outboundForm.productName}&limit=5`
      )

      const json = await res.json()

      const names = new Set()
      const products = []

      ;(json.data || []).forEach(item => {

        if (!names.has(item.product.name)) {

          names.add(item.product.name)

          products.push({
            id: item.product.id,
            name: item.product.name
          })

        }

      })

      setOutboundProductSuggestions(products)

    } catch (err) {
      console.error(err)
    }

  }, 300)

  return () => clearTimeout(delay)

}, [outboundForm.productName])
useEffect(() => {

  const delay = setTimeout(async () => {

    if (!outboundForm.locationCode) {
      setOutboundLocationSuggestions([])
      return
    }

    try {

      const res = await fetch(
        `/api/inventory?locationCode=${outboundForm.locationCode}&limit=5`
      )

      const json = await res.json()

      const codes = new Set()
      const locations = []

      ;(json.data || []).forEach(item => {

        if (!item.location) return

        if (!codes.has(item.location.code)) {

          codes.add(item.location.code)

          locations.push({
            id: item.location.id,
            code: item.location.code
          })

        }

      })

      setOutboundLocationSuggestions(locations)

    } catch (err) {
      console.error(err)
    }

  }, 300)

  return () => clearTimeout(delay)

}, [outboundForm.locationCode])
useEffect(() => {

  const delay = setTimeout(async () => {

    if (!inboundForm.locationCode) {
      setLocationSuggestions([])
      return
    }

    try {

      const res = await fetch(
        `/api/inventory?locationCode=${inboundForm.locationCode}&limit=5`
      )

      const json = await res.json()

      const uniqueLocations = []

      const codes = new Set()

      ;(json.data || []).forEach(item => {

  if (!item.location) return

  if (!codes.has(item.location.code)) {

    codes.add(item.location.code)

    uniqueLocations.push({
      id: item.location.id,
      code: item.location.code
    })

  }

})

      setLocationSuggestions(
        uniqueLocations
      )

    } catch (err) {
      console.error(err)
    }

  }, 300)

  return () => clearTimeout(delay)

}, [inboundForm.locationCode])
const handleSelectLocation = (
  location
) => {

  setInboundForm(prev => ({
    ...prev,
    locationCode: location.code
  }))

  setLocationSuggestions([])
}
  const handleSelectInboundProduct = (product) => {

  setInboundForm(prev => ({
    ...prev,
    name: product.name
  }))

  setInboundSuggestions([])
}
const handleSelectOutboundProduct = (
  product
) => {

  setOutboundForm(prev => ({
    ...prev,
    productName: product.name
  }))

  setOutboundProductSuggestions([])
}

const handleSelectOutboundLocation = (
  location
) => {

  setOutboundForm(prev => ({
    ...prev,
    locationCode: location.code
  }))

  setOutboundLocationSuggestions([])
}

  const handleSelectProduct = (item) => {
    setSelectedProduct(item)
    setSearch(item.product.name)
    setLocation(item.location.code)
    setSuggestions([])

    setPage(1)
  }

  // =========================
  // 🚨 ALERT (เบาขึ้น)
  // =========================
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/inventory?limit=20')
      const json = await res.json()

      const low = (json.data || []).filter(i => i.quantity < 5)
      setAlerts(low)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // =========================
  // 🔐 AUTH CHECK
  // =========================
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      window.location.href = '/login'
      return
    }

    const userData = localStorage.getItem('user')

      if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // =========================
  // INIT
  // =========================
  useEffect(() => {
  fetchChart()
  fetchStats()
}, [])

  return (
    <div style={container}>
      <Link href="/">
        <h1 style={title}>📦 WMS Dashboard</h1>
      </Link>
      {user && (
  <div style={userCard}>

    <div>
      <h2>
        Welcome, {user.name}
      </h2>

      <div>
        Role : {user.role}
      </div>
    </div>

    <button
      style={logoutBtn}
      onClick={() => {

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href =
          '/login'
      }}
    >
      Logout
    </button>

  </div>
)}
{user && (
  <div style={card}>

    <h3>📋 Menu</h3>

    <div style={menuGrid}>

      {user.role === 'ADMIN' && (
        <>
          <button
  style={menuBtn}
  onClick={async () => {

    await fetchProducts()

    setShowProducts(true)

  }}
>
  📦 Products
</button>

          <button style={menuBtn}>
            🏭 Warehouses
          </button>

          <button
  style={menuBtn}
  onClick={async () => {

    await fetchUsers()

    setShowUsers(true)

  }}
>
  👥 Users
</button>

          <button style={menuBtn}>
            📊 Reports
          </button>
        </>
      )}

      {user.role === 'STAFF' && (
        <>
          <button
  style={menuBtn}
  onClick={() =>
    setShowInbound(true)
  }
>
  📥 Inbound
</button>
<button
  style={menuBtn}
  onClick={() =>
    setShowOutbound(true)
  }
>
  📤 Outbound
</button>
        </>
      )}

    </div>

  </div>
)}
      <div style={statsGrid}>

  <div style={statCard}>
    <h2>{stats.inbound}</h2>
    <p>Inbound</p>
  </div>

  <div style={statCard}>
    <h2>{stats.outbound}</h2>
    <p>Outbound</p>
  </div>
  <div style={statCard}>
    <h2>{stats.inbound-stats.outbound}</h2>
    <p>Available Stock</p>
  </div>

</div>
      {/* ALERT */}
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
      {/* SEARCH */}
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

        <button
          style={btn}
          onClick={() => {
            setPage(1)
            fetchData()
          }}
        >
          Search
        </button>
      </div>

      {/* CHART - ADMIN ONLY */}
{user?.role === 'ADMIN' && (

  <div style={card}>

    <h3>📊 Transactions</h3>

    <input
      type="date"
      value={startDate}
      onChange={e => setStartDate(e.target.value)}
    />

    <input
      type="date"
      value={endDate}
      onChange={e => setEndDate(e.target.value)}
      style={{ marginLeft: 10 }}
    />

    <button
      style={btn}
      onClick={fetchChart}
    >
      Apply
    </button>

    <div style={{ marginTop: 20 }}>

      {chartData.length > 0 ? (

        <BarChart
          width={500}
          height={250}
          data={chartData}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="quantity"
            fill="#3b82f6"
          />
        </BarChart>

      ) : (

        <p>No data</p>

      )}

    </div>

  </div>

)}
      {showInbound && (

  <div style={modalOverlay}>

    <div style={modal}>

      <h2>
        📥 Inbound
      </h2>

      <div
  style={{
    position: 'relative'
  }}
>

  <input
    placeholder="Product Name"
    value={inboundForm.name}
    onChange={(e)=>
      setInboundForm({
        ...inboundForm,
        name:e.target.value
      })
    }
    style={input}
  />

  {inboundSuggestions.length > 0 && (

    <div style={dropdown}>

      {inboundSuggestions.map(
        product => (

          <div
            key={product.id}
            style={dropdownItem}
            onClick={() =>
              handleSelectInboundProduct(
                product
              )
            }
          >
            {product.name}
          </div>

        )
      )}

    </div>

  )}

</div>

      <input
        type="number"
        placeholder="Quantity"
        value={inboundForm.quantity}
        onChange={(e)=>
          setInboundForm({
            ...inboundForm,
            quantity:e.target.value
          })
        }
        style={input}
      />
  <div style={{ position: 'relative' }}>

  <input
    placeholder="Location Code"
    value={inboundForm.locationCode}
    onChange={(e)=>
      setInboundForm({
        ...inboundForm,
        locationCode: e.target.value
      })
    }
    style={input}
  />

  {locationSuggestions.length > 0 && (

    <div style={dropdown}>

      {locationSuggestions.map(
        location => (

          <div
            key={location.id}
            style={dropdownItem}
            onClick={() =>
              handleSelectLocation(
                location
              )
            }
          >
            {location.code}
          </div>

        )
      )}

    </div>

  )}

</div>

      <div>

        <button
          style={btn}
          onClick={handleInbound}
        >
          Save
        </button>

        <button
          style={closeBtn}
          onClick={() =>
            setShowInbound(false)
          }
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}
{showOutbound && (

  <div style={modalOverlay}>

    <div style={modal}>

      <h2>
        📤 Outbound
      </h2>

      <div style={{ position: 'relative' }}>

  <input
    placeholder="Product Name"
    value={outboundForm.productName}
    onChange={(e) =>
      setOutboundForm({
        ...outboundForm,
        productName: e.target.value
      })
    }
    style={input}
  />

  {outboundProductSuggestions.length > 0 && (

    <div style={dropdown}>

      {outboundProductSuggestions.map(product => (

        <div
          key={product.id}
          style={dropdownItem}
          onClick={() =>
            handleSelectOutboundProduct(product)
          }
        >
          {product.name}
        </div>

      ))}

    </div>

  )}

</div>
<div style={{ position: 'relative' }}>

  <input
    placeholder="Location Code"
    value={outboundForm.locationCode}
    onChange={(e) =>
      setOutboundForm({
        ...outboundForm,
        locationCode: e.target.value
      })
    }
    style={input}
  />

  {outboundLocationSuggestions.length > 0 && (

    <div style={dropdown}>

      {outboundLocationSuggestions.map(location => (

        <div
          key={location.id}
          style={dropdownItem}
          onClick={() =>
            handleSelectOutboundLocation(location)
          }
        >
          {location.code}
        </div>

      ))}

    </div>

  )}

</div>

      <input
        type="number"
        placeholder="Quantity"
        value={outboundForm.quantity}
        onChange={(e)=>
          setOutboundForm({
            ...outboundForm,
            quantity:e.target.value
          })
        }
        style={input}
      />

      <div>

        <button
          style={btn}
          onClick={handleOutbound}
        >
          Save
        </button>

        <button
          style={closeBtn}
          onClick={() =>
            setShowOutbound(false)
          }
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}
{showProducts && (

  <div style={modalOverlay}>

    <div
      style={{
        ...modal,
        width: 500,
        maxHeight: '70vh'
      }}
    >

      <h2>
        📦 Product List
      </h2>

      <div
        style={{
          overflowY: 'auto',
          maxHeight: 300
        }}
      >

        {products.length === 0 ? (

          <p>
            No Products
          </p>

        ) : (

          products.map(product => (

            <div
              key={product.id}
              style={{
                padding: 10,
                borderBottom:
                  '1px solid #eee'
              }}
            >
              {product.name}
            </div>

          ))

        )}

      </div>

      <button
        style={closeBtn}
        onClick={() =>
          setShowProducts(false)
        }
      >
        Close
      </button>

    </div>

  </div>

)}
{showUsers && (

  <div style={modalOverlay}>

    <div
      style={{
        ...modal,
        width: 700,
        maxHeight: '70vh'
      }}
    >

      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  }}
>
  <h2 style={{ margin: 0 }}>
    👥 User List
  </h2>

  <button
    style={{
      ...btn,
      padding: '6px 12px',
      fontSize: 14,
      width: 'auto'
    }}
    onClick={() => setShowAddUser(true)}
  >
     Add User
  </button>
</div>
      <div
        style={{
          overflowY: 'auto',
          maxHeight: 400
        }}
      >

        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse'
          }}
        >

          <thead>

            <tr>

              <th style={th}>
                Name
              </th>

              <th style={th}>
                Email
              </th>

              <th style={th}>
                Role
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map(user => (

              <tr key={user.id}>

                <td style={td}>
                  {user.name}
                </td>

                <td style={td}>
                  {user.email}
                </td>

                <td style={td}>
                  {user.role}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <button
        style={closeBtn}
        onClick={() =>
          setShowUsers(false)
        }
      >
        Close
      </button>

    </div>

  </div>

)}
{showAddUser && (
  <div style={modalOverlay}>
    <div style={modal}>

      <h2>Add User</h2>

      <input
        style={input}
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        style={input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        style={input}
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="ADMIN">ADMIN</option>
        <option value="STAFF">STAFF</option>
        <option value="VIEWER">VIEWER</option>
      </select>

      <button
        style={btn}
        onClick={createUser}
      >
        Save
      </button>

      <button
        style={closeBtn}
        onClick={() => setShowAddUser(false)}
      >
        Close
      </button>

    </div>
  </div>
)}
      {/* TABLE */}
      <div style={card}>
        <h3>📦 Inventory</h3>

        {loading && <p>Loading...</p>}

        {!loading && (
          <>
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
                    <td style={{ ...td, color: i.quantity < 5 ? 'red' : '#000' }}>
                      {i.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div style={{ marginTop: 15 }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={btn}>
                Prev
              </button>

              <span style={{ margin: '0 10px' }}>
                Page {page} / {totalPages}
              </span>

              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={btn}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// STYLE
const container = { padding: 30, background: '#f8fafc', minHeight: '100vh', color: '#000' }
const title = { fontSize: 24, fontWeight: 600, marginBottom: 20 }
const card = { background: '#fff', padding: 20, borderRadius: 10, marginBottom: 20, border: '1px solid #e5e7eb' }
const input = { padding: 8, marginTop: 10, marginRight: 10, border: '1px solid #ccc', borderRadius: 6, color: '#000' }
const btn = { padding: '8px 14px', marginLeft: 5, background: '#3b82f6', color: '#fff', borderRadius: 6, cursor: 'pointer' }
const dropdown = { position: 'absolute', background: '#fff', border: '1px solid #ccc', width: 250, zIndex: 10 }
const dropdownItem = { padding: 8, cursor: 'pointer' }
const table = { width: '100%', borderCollapse: 'collapse' }
const th = { padding: 10, borderBottom: '1px solid #ddd', textAlign: 'left' }
const td = {padding: 10,borderBottom: '1px solid #eee'}
const userCard = {background: '#fff',padding: 20,borderRadius: 10,border: '1px solid #e5e7eb',marginBottom: 20,display: 'flex',justifyContent: 'space-between',alignItems: 'center'}
const logoutBtn = {background: '#ef4444',color: '#fff',border: 'none',borderRadius: 8,padding: '10px 15px',cursor: 'pointer'}
const menuGrid = {display: 'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap: 15}
const menuBtn = {background: '#fff',border: '1px solid #d1d5db',borderRadius: 8,padding: 15,cursor: 'pointer',color: '#000',fontWeight: 600}
const statsGrid = {display: 'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap: 20,marginBottom: 20}
const statCard = {background: '#fff',border: '1px solid #e5e7eb',borderRadius: 10,padding: 20,textAlign: 'center'}
const modalOverlay = {position: 'fixed',inset: 0,background:'rgba(0,0,0,0.5)',display: 'flex',justifyContent: 'center',alignItems: 'center',zIndex: 999}
const modal = {background: '#fff',padding: 25,borderRadius: 12,width: 400,display: 'flex',flexDirection: 'column',gap: 10}
const closeBtn = {padding: '8px 14px',marginLeft: 10,background: '#ef4444',color: '#fff',borderRadius: 6,cursor: 'pointer'}