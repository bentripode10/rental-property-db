// src/pages/LoginPage.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode]       = useState('login')   // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setError('Account created! Check your email to confirm, then sign in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#f8f7f4', fontFamily:'system-ui, sans-serif',
    }}>
      <div style={{
        background:'#fff', borderRadius:16, border:'0.5px solid rgba(0,0,0,0.1)',
        padding:'32px 36px', width:'100%', maxWidth:400,
      }}>
        {/* Header */}
        <div style={{ marginBottom:28, textAlign:'center' }}>
          <div style={{ fontSize:22, fontWeight:600, color:'#0c2340', marginBottom:6 }}>
            Property DB
          </div>
          <div style={{ fontSize:13, color:'#888' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </div>
        </div>

        <form onSubmit={handle}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'#666', display:'block', marginBottom:5 }}>
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, fontWeight:600, color:'#666', display:'block', marginBottom:5 }}>
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              fontSize:12, padding:'8px 12px', borderRadius:8, marginBottom:14,
              background: error.includes('created') ? '#eaf3de' : '#fcebeb',
              color: error.includes('created') ? '#3b6d11' : '#a32d2d',
              border: `0.5px solid ${error.includes('created') ? '#97c459' : '#f09595'}`,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:'100%', padding:'11px', borderRadius:8, border:'none',
            background:'#185fa5', color:'#fff', fontSize:13, fontWeight:600,
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop:18, textAlign:'center', fontSize:12, color:'#888' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => setMode('signup')} style={linkStyle}>
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} style={linkStyle}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width:'100%', padding:'9px 12px', borderRadius:8, fontSize:13,
  border:'0.5px solid rgba(0,0,0,0.15)', background:'#fff', color:'#111',
  outline:'none', boxSizing:'border-box',
}

const linkStyle = {
  border:'none', background:'transparent', color:'#185fa5',
  fontSize:12, cursor:'pointer', fontWeight:500, padding:0,
}
