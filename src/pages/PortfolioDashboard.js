// src/pages/PortfolioDashboard.js
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProperties, getTransactions, getLeases } from '../lib/supabase'

const fmt   = n => '$' + Math.round(n || 0).toLocaleString('en-US')
const fmtD  = n => '$' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })

const SCHED_E_LABELS = {
  rents:'Rents received', advertising:'Advertising', auto:'Auto & travel',
  cleaning:'Cleaning & maintenance', commissions:'Commissions',
  insurance:'Insurance', legal:'Legal & professional fees',
  management:'Management fees', mortgage:'Mortgage interest',
  other_int:'Other interest', repairs:'Repairs', supplies:'Supplies',
  taxes:'Taxes', utilities:'Utilities', depreciation:'Depreciation', other:'Other',
}

const Card = ({ label, value, color }) => (
  <div style={{
    background:'#f1efe8', borderRadius:8, padding:'10px 14px',
  }}>
    <div style={{ fontSize:11, color:'#888', marginBottom:4 }}>{label}</div>
    <div style={{ fontSize:20, fontWeight:600, color: color || '#111' }}>{value}</div>
  </div>
)

export default function PortfolioDashboard() {
  const [properties,    setProperties]    = useState([])
  const [transactions,  setTransactions]  = useState([])
  const [leases,        setLeases]        = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    Promise.all([
      getProperties(),
      getTransactions({ year: new Date().getFullYear() }),
      getLeases(),
    ]).then(([props, txs, ls]) => {
      setProperties(props)
      setTransactions(txs)
      setLeases(ls)
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color:'#888', fontSize:13 }}>Loading portfolio…</div>
  if (error)   return <div style={{ color:'#a32d2d', fontSize:13 }}>Error: {error}</div>

  const income   = transactions.filter(t => t.type === 'income').reduce((s,t)  => s + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)
  const noi      = income - expenses
  const margin   = income > 0 ? Math.round((noi / income) * 100) : 0
  const occupied = properties.filter(p => p.status === 'occupied').length
  const occ      = properties.length > 0 ? Math.round((occupied / properties.length) * 100) : 0

  // Schedule E totals
  const schedE = {}
  transactions.forEach(tx => {
    if (!tx.category) return
    if (!schedE[tx.category]) schedE[tx.category] = 0
    schedE[tx.category] += Number(tx.amount)
  })

  // Lease watch
  const activeLeases = leases.filter(l => ['active','month_to_month'].includes(l.status))
  const expiringSoon = activeLeases.filter(l => {
    const days = Math.ceil((new Date(l.end_date) - new Date()) / 86400000)
    return days <= 120 && days > 0
  }).sort((a,b) => new Date(a.end_date) - new Date(b.end_date))

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:0 }}>Portfolio dashboard</h1>
          <p style={{ fontSize:12, color:'#888', margin:'4px 0 0' }}>
            {new Date().getFullYear()} year-to-date · {properties.length} properties
          </p>
        </div>
        <Link to="/reports" style={{
          fontSize:12, padding:'7px 14px', borderRadius:8,
          background:'#e6f1fb', color:'#185fa5', border:'0.5px solid #b5d4f4',
          textDecoration:'none', fontWeight:500,
        }}>
          Export reports ↗
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:10, marginBottom:20 }}>
        <Card label="YTD income"        value={fmt(income)}   color="#3b6d11" />
        <Card label="YTD expenses"      value={fmt(expenses)} color="#a32d2d" />
        <Card label="Net operating income" value={fmt(noi)}   color={noi>=0?"#3b6d11":"#a32d2d"} />
        <Card label="Occupancy"         value={`${occ}%`}     color="#854f0b" />
      </div>

      {/* Properties table */}
      <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, marginBottom:16, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'0.5px solid rgba(0,0,0,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:13, fontWeight:500, color:'#111' }}>Properties</span>
          <Link to="/properties" style={{ fontSize:12, color:'#185fa5', textDecoration:'none' }}>View all</Link>
        </div>
        {properties.length === 0 ? (
          <div style={{ padding:'24px', textAlign:'center', color:'#aaa', fontSize:13 }}>
            No properties yet. <Link to="/properties" style={{ color:'#185fa5' }}>Add your first property →</Link>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#f8f7f4' }}>
                {['Address','City','Status','Monthly rent','YTD income','YTD expenses','NOI'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'7px 12px', fontSize:11, color:'#888', fontWeight:500, borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p, i) => {
                const ptxs    = transactions.filter(t => t.property_id === p.id)
                const pincome = ptxs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
                const pexp    = ptxs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
                const pnoi    = pincome - pexp
                const lease   = activeLeases.find(l => l.property_id === p.id)
                const statusColor = { occupied:'#3b6d11', vacant:'#a32d2d', under_renovation:'#854f0b' }[p.status] || '#888'
                const statusBg    = { occupied:'#eaf3de', vacant:'#fcebeb', under_renovation:'#faeeda' }[p.status] || '#f1efe8'
                return (
                  <tr key={p.id} style={{ background: i%2===0 ? '#fff' : '#f8f7f4' }}>
                    <td style={{ padding:'9px 12px', fontWeight:500 }}>
                      <Link to={`/properties/${p.id}`} style={{ color:'#185fa5', textDecoration:'none' }}>{p.address}</Link>
                    </td>
                    <td style={{ padding:'9px 12px', color:'#666' }}>{p.city}</td>
                    <td style={{ padding:'9px 12px' }}>
                      <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:statusBg, color:statusColor, fontWeight:500 }}>
                        {p.status.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{ padding:'9px 12px' }}>{lease ? fmtD(lease.monthly_rent) : '—'}</td>
                    <td style={{ padding:'9px 12px', color:'#3b6d11', fontWeight:500 }}>{fmt(pincome)}</td>
                    <td style={{ padding:'9px 12px', color:'#a32d2d' }}>{fmt(pexp)}</td>
                    <td style={{ padding:'9px 12px', color: pnoi>=0?'#3b6d11':'#a32d2d', fontWeight:500 }}>{fmt(pnoi)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom row: lease watch + Schedule E */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

        {/* Lease watch */}
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#111', marginBottom:12 }}>Lease watch</div>
          {expiringSoon.length === 0 ? (
            <div style={{ fontSize:12, color:'#aaa' }}>No leases expiring in the next 120 days.</div>
          ) : expiringSoon.map(l => {
            const days = Math.ceil((new Date(l.end_date) - new Date()) / 86400000)
            const urgent = days <= 60
            return (
              <div key={l.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)', fontSize:12 }}>
                <div>
                  <div style={{ fontWeight:500, color:'#111' }}>{l.properties?.address}</div>
                  <div style={{ color:'#888', fontSize:11 }}>{l.tenants?.name} · expires {new Date(l.end_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div>
                </div>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, fontWeight:500,
                  background: urgent ? '#faeeda' : '#e6f1fb',
                  color: urgent ? '#854f0b' : '#185fa5' }}>
                  {days}d
                </span>
              </div>
            )
          })}
          <Link to="/leases" style={{ fontSize:12, color:'#185fa5', textDecoration:'none', display:'block', marginTop:10 }}>View all leases →</Link>
        </div>

        {/* Schedule E summary */}
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:'14px 16px' }}>
          <div style={{ fontSize:13, fontWeight:500, color:'#111', marginBottom:12 }}>Schedule E summary (YTD)</div>
          {Object.keys(schedE).length === 0 ? (
            <div style={{ fontSize:12, color:'#aaa' }}>No categorized transactions yet. Visit Reconciliation to assign Schedule E categories.</div>
          ) : Object.entries(schedE).map(([cat, total]) => (
            <div key={cat} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)', fontSize:12 }}>
              <span style={{ color:'#555' }}>{SCHED_E_LABELS[cat] || cat}</span>
              <span style={{ fontWeight:500, color: cat==='rents' ? '#3b6d11' : '#a32d2d' }}>
                {cat==='rents' ? '+' : '-'}{fmt(total)}
              </span>
            </div>
          ))}
          <Link to="/reconciliation" style={{ fontSize:12, color:'#185fa5', textDecoration:'none', display:'block', marginTop:10 }}>Manage reconciliation →</Link>
        </div>
      </div>
    </div>
  )
}
