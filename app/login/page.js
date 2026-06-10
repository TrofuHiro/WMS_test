'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error)
        return
      }

      localStorage.setItem('token', data.token)

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      )

      window.location.href = '/'

    } catch (err) {
      console.error(err)
      alert('Login Failed')
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>WMS Login</h1>

        <p style={subtitle}>
          Warehouse Management System
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        <button
          onClick={handleLogin}
          style={button}
        >
          Login
        </button>
      </div>
    </div>
  )
}

// ======================
// 🎨 STYLE
// ======================

const container = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#f8fafc'
}

const card = {
  width: '100%',
  maxWidth: '400px',
  background: '#ffffff',
  padding: '40px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
}

const title = {
  textAlign: 'center',
  color: '#111827',
  marginBottom: '8px'
}

const subtitle = {
  textAlign: 'center',
  color: '#6b7280',
  marginBottom: '30px'
}

const input = {
  width: '100%',
  padding: '12px',
  marginBottom: '15px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box'
}

const button = {
  width: '100%',
  padding: '12px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: '600'
}