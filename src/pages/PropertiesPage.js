// src/pages/PropertiesPage.js
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProperties, upsertProperty, deleteProperty } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const EMPTY = {
  address:'', city:'', state:'TX', zip:'', county:'',
  status:'occupied', purchase_price:'', purchase_date:'',
  land_value:'', bedrooms:'', bathrooms:'', square_feet:'', year_built:'', notes:''
}

export default function PropertiesPage() {
  const { user }              = useAuth()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const load = () => getProperties().then(setProperties).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await upsertProperty({ ...form, user_id: user.id })
      setShowForm(false); setForm(EMPTY); load()
    } catch(err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This will also delete all associated records.')) return
    await deleteProperty(id); load()
  }

  const statusStyle = {
    occupied:         { bg:'#eaf3de', color:'#3b6d11' },
    vacant:           { bg:'#fcebeb', color:'#a32d2d' },
    under_renovation: { bg:'#faeeda', color:'#854f0b' },
  }

  if (loading) return <div style={{ color:'#888', fontSize:13 }}>Loading properties…</div>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:0 }}>Properties</h1>
        <button onClick={() => { setShowForm(true); setForm(EMPTY) }} style={primaryBtn}>
          + Add property
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:14, fontWeight:500, marginBottom:16 }}>
            {form.id ? 'Edit property' : 'New property'}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={grid2}>
              <Field label="Street address" required>
                <input style={inputS} value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required />
              </Field>
              <Field label="City">
                <input style={inputS} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} />
              </Field>
              <Field label="State">
                <input style={inputS} value={form.state} onChange={e=>setForm({...form,state:e.target.value})} />
              </Field>
              <Field label="ZIP">
                <input style={inputS} value={form.zip} onChange={e=>setForm({...form,zip:e.target.value})} />
              </Field>
              <Field label="County">
                <input style={inputS} value={form.county} onChange={e=>setForm({...form,county:e.target.value})} />
              </Field>
              <Field label="Status">
                <select style={inputS} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="under_renovation">Under renovation</option>
                </select>
              </Field>
              <Field label="Purchase price ($)">
                <input style={inputS} type="number" value={form.purchase_price} onChange={e=>setForm({...form,purchase_price:e.target.value})} />
              </Field>
              <Field label="Purchase date">
                <input style={inputS} type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})} />
              </Field>
              <Field label="Land value ($)">
                <input style={inputS} type="number" value={form.land_value} onChange={e=>setForm({...form,land_value:e.target.value})} />
              </Field>
              <Field label="Year built">
                <input style={inputS} type="number" value={form.year_built} onChange={e=>setForm({...form,year_built:e.target.value})} />
              </Field>
              <Field label="Bedrooms">
                <input style={inputS} type="number" value={form.bedrooms} onChange={e=>setForm({...form,bedrooms:e.target.value})} />
              </Field>
              <Field label="Bathrooms">
                <input style={inputS} type="number" step="0.5" value={form.bathrooms} onChange={e=>setForm({...form,bathrooms:e.target.value})} />
              </Field>
              <Field label="Square feet">
                <input style={inputS} type="number" value={form.square_feet} onChange={e=>setForm({...form,square_feet:e.target.value})} />
              </Field>
            </div>
            <Field label="Notes" style={{ marginTop:8 }}>
              <textarea style={{...inputS,height:60,resize:'vertical'}} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
            </Field>
            {error && <div style={{ fontSize:12, color:'#a32d2d', margin:'8px 0' }}>{error}</div>}
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save property'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={ghostBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Properties grid */}
      {properties.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px 0', color:'#aaa', fontSize:13 }}>
          No properties yet. Click "Add property" to get started.
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {properties.map(p => {
            const ss = statusStyle[p.status] || { bg:'#f1efe8', color:'#888' }
            return (
              <div key={p.id} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'#111' }}>{p.address}</div>
                    <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{p.city}, {p.state} {p.zip}</div>
                  </div>
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, fontWeight:500, background:ss.bg, color:ss.color }}>
                    {p.status.replace('_',' ')}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:12 }}>
                  {[
                    ['Purchased', p.purchase_date ? new Date(p.purchase_date+'T12:00').toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—'],
                    ['Purchase price', p.purchase_price ? '$'+Number(p.purchase_price).toLocaleString() : '—'],
                    ['Beds / baths', p.bedrooms ? `${p.bedrooms}bd / ${p.bathrooms}ba` : '—'],
                    ['Sq ft', p.square_feet ? Number(p.square_feet).toLocaleString() : '—'],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background:'#f8f7f4', borderRadius:6, padding:'6px 8px' }}>
                      <div style={{ fontSize:10, color:'#aaa' }}>{label}</div>
                      <div style={{ fontSize:12, fontWeight:500, color:'#111', marginTop:1 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <Link to={`/properties/${p.id}`} style={{ ...ghostBtn, fontSize:11, textDecoration:'none', flex:1, textAlign:'center' }}>View detail</Link>
                  <button onClick={() => { setForm({...p, purchase_date: p.purchase_date?.slice(0,10)||'', land_value: p.land_value||''}); setShowForm(true) }}
                    style={{ ...ghostBtn, fontSize:11, flex:1 }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ ...ghostBtn, fontSize:11, color:'#a32d2d', borderColor:'#f09595' }}>Delete</button>
                </div>
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
const inputS   = { width:'100%', padding:'7px 9px', borderRadius:7, fontSize:12, border:'0.5px solid rgba(0,0,0,0.15)', background:'#fff', color:'#111', boxSizing:'border-box' }
const primaryBtn = { padding:'7px 16px', borderRadius:8, border:'0.5px solid #185fa5', background:'#e6f1fb', color:'#185fa5', fontSize:12, fontWeight:500, cursor:'pointer' }
const ghostBtn   = { padding:'7px 14px', borderRadius:8, border:'0.5px solid rgba(0,0,0,0.15)', background:'transparent', color:'#555', fontSize:12, cursor:'pointer' }
