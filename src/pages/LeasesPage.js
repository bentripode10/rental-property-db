// src/pages/LeasesPage.js
import React, { useEffect, useState } from 'react'
import { getLeases, upsertLease, getProperties, getTenants } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  property_id:'', tenant_id:'', start_date:'', end_date:'',
  monthly_rent:'', security_deposit:'', late_fee:'',
  status:'active', pet_policy:'', notes:''
}

const STATUS_STYLE = {
  active:         { bg:'#eaf3de', color:'#3b6d11', label:'Active' },
  expired:        { bg:'#f1efe8', color:'#444441', label:'Expired' },
  month_to_month: { bg:'#e6f1fb', color:'#0c447c', label:'Month-to-month' },
  terminated:     { bg:'#fcebeb', color:'#a32d2d', label:'Terminated' },
}

export default function LeasesPage() {
  const { user }                    = useAuth()
  const [leases,      setLeases]    = useState([])
  const [properties,  setProperties]= useState([])
  const [tenants,     setTenants]   = useState([])
  const [loading,     setLoading]   = useState(true)
  const [showForm,    setShowForm]  = useState(false)
  const [form,        setForm]      = useState(EMPTY)
  const [saving,      setSaving]    = useState(false)
  const [error,       setError]     = useState('')
  const [filter,      setFilter]    = useState('all')

  const load = () =>
    Promise.all([getLeases(), getProperties(), getTenants()])
      .then(([l, p, t]) => { setLeases(l); setProperties(p); setTenants(t) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await upsertLease({ ...form, user_id: user.id })
      setShowForm(false); setForm(EMPTY); load()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const daysUntil = (dateStr) =>
    Math.ceil((new Date(dateStr) - new Date()) / 86400000)

  const filtered = leases.filter(l => {
    if (filter === 'all') return true
    if (filter === 'active') return l.status === 'active' || l.status === 'month_to_month'
    if (filter === 'expiring') {
      const d = daysUntil(l.end_date)
      return d <= 120 && d > 0 && l.status === 'active'
    }
    return l.status === filter
  })

  const expiringSoon = leases.filter(l => {
    const d = daysUntil(l.end_date)
    return d <= 120 && d > 0 && l.status === 'active'
  })

  if (loading) return <div style={{ color:'#888', fontSize:13 }}>Loading leases…</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:0 }}>Leases</h1>
          <p style={{ fontSize:12, color:'#888', margin:'4px 0 0' }}>{leases.length} total lease{leases.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(EMPTY) }} style={primaryBtn}>+ Add lease</button>
      </div>

      {/* Expiring soon banner */}
      {expiringSoon.length > 0 && (
        <div style={{ background:'#faeeda', border:'0.5px solid #ef9f27', borderRadius:10, padding:'10px 14px',
          marginBottom:16, fontSize:12, color:'#633806', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:16 }}>⚠️</span>
          <div>
            <strong>{expiringSoon.length} lease{expiringSoon.length > 1 ? 's' : ''} expiring within 120 days:</strong>{' '}
            {expiringSoon.map(l => `${l.properties?.address} (${daysUntil(l.end_date)}d)`).join(' · ')}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {[['all','All'],['active','Active'],['expiring','Expiring soon'],['month_to_month','Month-to-month'],['expired','Expired']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            ...ghostBtn, fontSize:11,
            background: filter===val ? '#e6f1fb' : 'transparent',
            color: filter===val ? '#185fa5' : '#555',
            borderColor: filter===val ? '#b5d4f4' : 'rgba(0,0,0,0.15)',
          }}>{label}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={formWrap}>
          <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>{form.id ? 'Edit lease' : 'New lease'}</div>
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <Field label="Property" required>
                <select style={inputS} value={form.property_id} onChange={e=>setForm({...form,property_id:e.target.value})} required>
                  <option value="">— Select property —</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
              </Field>
              <Field label="Tenant">
                <select style={inputS} value={form.tenant_id} onChange={e=>setForm({...form,tenant_id:e.target.value})}>
                  <option value="">— Select tenant —</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Lease start" required>
                <input style={inputS} type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required />
              </Field>
              <Field label="Lease end" required>
                <input style={inputS} type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} required />
              </Field>
              <Field label="Monthly rent ($)" required>
                <input style={inputS} type="number" step="0.01" value={form.monthly_rent} onChange={e=>setForm({...form,monthly_rent:e.target.value})} required />
              </Field>
              <Field label="Security deposit ($)">
                <input style={inputS} type="number" step="0.01" value={form.security_deposit} onChange={e=>setForm({...form,security_deposit:e.target.value})} />
              </Field>
              <Field label="Late fee ($)">
                <input style={inputS} type="number" step="0.01" value={form.late_fee} onChange={e=>setForm({...form,late_fee:e.target.value})} />
              </Field>
              <Field label="Status">
                <select style={inputS} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="month_to_month">Month-to-month</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </Field>
              <Field label="Pet policy">
                <input style={inputS} value={form.pet_policy} onChange={e=>setForm({...form,pet_policy:e.target.value})} placeholder="e.g. No pets / 1 dog under 30 lbs" />
              </Field>
            </div>
            <Field label="Notes" style={{ marginTop:10 }}>
              <textarea style={{...inputS,height:60,resize:'vertical'}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
            </Field>
            {error && <div style={{ fontSize:12, color:'#a32d2d', margin:'8px 0' }}>{error}</div>}
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save lease'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={ghostBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Leases table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#aaa', fontSize:13 }}>
          No leases found. Click "Add lease" to get started.
        </div>
      ) : (
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr style={{ background:'#f8f7f4' }}>
                {['Property','Tenant','Start','End','Days left','Rent','Deposit','Status',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'8px 12px', fontSize:11, color:'#888', fontWeight:500, borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const days   = daysUntil(l.end_date)
                const ss     = STATUS_STYLE[l.status] || STATUS_STYLE.active
                const urgent = days <= 60 && days > 0 && l.status === 'active'
                const fmt    = (d) => d ? new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'2-digit'}) : '—'
                return (
                  <tr key={l.id} style={{ background: i%2===0 ? '#fff' : '#f8f7f4' }}>
                    <td style={{ padding:'9px 12px', fontWeight:500, color:'#111' }}>{l.properties?.address || '—'}</td>
                    <td style={{ padding:'9px 12px', color:'#555' }}>{l.tenants?.name || '—'}</td>
                    <td style={{ padding:'9px 12px', color:'#666' }}>{fmt(l.start_date)}</td>
                    <td style={{ padding:'9px 12px', color:'#666' }}>{fmt(l.end_date)}</td>
                    <td style={{ padding:'9px 12px' }}>
                      {l.status === 'active' || l.status === 'month_to_month' ? (
                        <span style={{ color: urgent ? '#a32d2d' : days <= 120 ? '#854f0b' : '#3b6d11', fontWeight:500 }}>
                          {days > 0 ? `${days}d` : 'Expired'}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding:'9px 12px', fontWeight:500, color:'#111' }}>
                      {l.monthly_rent ? '$'+Number(l.monthly_rent).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding:'9px 12px', color:'#666' }}>
                      {l.security_deposit ? '$'+Number(l.security_deposit).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, fontWeight:500, background:ss.bg, color:ss.color }}>{ss.label}</span>
                    </td>
                    <td style={{ padding:'9px 12px' }}>
                      <button onClick={() => {
                        setForm({
                          ...l,
                          start_date: l.start_date?.slice(0,10)||'',
                          end_date:   l.end_date?.slice(0,10)||'',
                        })
                        setShowForm(true)
                      }} style={{ ...ghostBtn, fontSize:11, padding:'4px 10px' }}>Edit</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const Field = ({ label, children, required }) => (
  <div>
    <label style={{ fontSize:11, fontWeight:500, color:'#666', display:'block', marginBottom:4 }}>
      {label}{required && <span style={{ color:'#a32d2d' }}> *</span>}
    </label>
    {children}
  </div>
)

const grid2    = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 14px' }
const inputS   = { width:'100%', padding:'7px 9px', borderRadius:7, fontSize:12, border:'0.5px solid rgba(0,0,0,0.15)', background:'#fff', color:'#111', boxSizing:'border-box', outline:'none' }
const formWrap = { background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:20, marginBottom:20 }
const primaryBtn = { padding:'7px 16px', borderRadius:8, border:'0.5px solid #185fa5', background:'#e6f1fb', color:'#185fa5', fontSize:12, fontWeight:500, cursor:'pointer' }
const ghostBtn   = { padding:'7px 14px', borderRadius:8, border:'0.5px solid rgba(0,0,0,0.15)', background:'transparent', color:'#555', fontSize:12, cursor:'pointer' }
