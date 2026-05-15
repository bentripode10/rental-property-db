// src/pages/TenantsPage.js
import React, { useEffect, useState } from 'react'
import { getTenants, upsertTenant, getProperties } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  property_id:'', name:'', email:'', phone:'',
  move_in_date:'', emergency_contact:'', emergency_phone:'', notes:''
}

export default function TenantsPage() {
  const { user }                    = useAuth()
  const [tenants,     setTenants]   = useState([])
  const [properties,  setProperties]= useState([])
  const [loading,     setLoading]   = useState(true)
  const [showForm,    setShowForm]  = useState(false)
  const [form,        setForm]      = useState(EMPTY)
  const [saving,      setSaving]    = useState(false)
  const [error,       setError]     = useState('')
  const [search,      setSearch]    = useState('')

  const load = () =>
    Promise.all([getTenants(), getProperties()])
      .then(([t, p]) => { setTenants(t); setProperties(p) })
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await upsertTenant({ ...form, user_id: user.id })
      setShowForm(false); setForm(EMPTY); load()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const initials = (name) => name.split(' ').filter((_,i,a)=>i===0||i===a.length-1).map(n=>n[0]||'').join('').toUpperCase()

  const filtered = tenants.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ color:'#888', fontSize:13 }}>Loading tenants…</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:0 }}>Tenants</h1>
          <p style={{ fontSize:12, color:'#888', margin:'4px 0 0' }}>{tenants.length} total tenant{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setShowForm(true); setForm(EMPTY) }} style={primaryBtn}>+ Add tenant</button>
      </div>

      {/* Search */}
      <input
        placeholder="Search tenants by name or email…"
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ ...inputS, marginBottom:16, maxWidth:360, display:'block' }}
      />

      {/* Form */}
      {showForm && (
        <div style={formWrap}>
          <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>{form.id ? 'Edit tenant' : 'New tenant'}</div>
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <Field label="Full name" required>
                <input style={inputS} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
              </Field>
              <Field label="Property">
                <select style={inputS} value={form.property_id} onChange={e=>setForm({...form,property_id:e.target.value})}>
                  <option value="">— Select property —</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
              </Field>
              <Field label="Email">
                <input style={inputS} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
              </Field>
              <Field label="Phone">
                <input style={inputS} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
              </Field>
              <Field label="Move-in date">
                <input style={inputS} type="date" value={form.move_in_date} onChange={e=>setForm({...form,move_in_date:e.target.value})} />
              </Field>
              <Field label="Emergency contact name">
                <input style={inputS} value={form.emergency_contact} onChange={e=>setForm({...form,emergency_contact:e.target.value})} />
              </Field>
              <Field label="Emergency contact phone">
                <input style={inputS} value={form.emergency_phone} onChange={e=>setForm({...form,emergency_phone:e.target.value})} />
              </Field>
            </div>
            <Field label="Notes" style={{ marginTop:8 }}>
              <textarea style={{...inputS,height:60,resize:'vertical'}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
            </Field>
            {error && <div style={{ fontSize:12, color:'#a32d2d', margin:'8px 0' }}>{error}</div>}
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save tenant'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={ghostBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Tenant cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#aaa', fontSize:13 }}>
          {search ? 'No tenants match your search.' : 'No tenants yet. Click "Add tenant" to get started.'}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.map(t => {
            const prop = properties.find(p => p.id === t.property_id)
            const avatarColors = [
              ['#e6f1fb','#0c447c'], ['#eeedfe','#3c3489'], ['#eaf3de','#27500a'],
              ['#faeeda','#633806'], ['#fce8e8','#791f1f'],
            ]
            const col = avatarColors[t.name.charCodeAt(0) % avatarColors.length]
            return (
              <div key={t.id} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:col[0], color:col[1],
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:14, flexShrink:0 }}>
                    {initials(t.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight:500, fontSize:14, color:'#111' }}>{t.name}</div>
                    <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{prop?.address || 'No property assigned'}</div>
                  </div>
                </div>
                {[
                  ['Email', t.email, '#185fa5'],
                  ['Phone', t.phone, null],
                  ['Move-in', t.move_in_date ? new Date(t.move_in_date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—', null],
                  ['Emergency', t.emergency_contact ? `${t.emergency_contact} · ${t.emergency_phone||''}` : '—', null],
                ].map(([label, val, color]) => val ? (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'0.5px solid rgba(0,0,0,0.05)', fontSize:12 }}>
                    <span style={{ color:'#888' }}>{label}</span>
                    <span style={{ fontWeight:500, color: color||'#111', maxWidth:180, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val}</span>
                  </div>
                ) : null)}
                {t.notes && (
                  <div style={{ marginTop:8, fontSize:11, color:'#888', fontStyle:'italic', lineHeight:1.5 }}>{t.notes}</div>
                )}
                <button onClick={() => {
                  setForm({...t, move_in_date: t.move_in_date?.slice(0,10)||''})
                  setShowForm(true)
                }} style={{ ...ghostBtn, fontSize:11, marginTop:12, width:'100%' }}>Edit tenant</button>
              </div>
            )
          })}
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
