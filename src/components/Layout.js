// src/components/Layout.js
import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { section: 'Overview',
    items: [
      { to: '/',            label: 'Portfolio dashboard', icon: 'grid' },
    ]
  },
  { section: 'Properties',
    items: [
      { to: '/properties',  label: 'All properties',      icon: 'home' },
      { to: '/tenants',     label: 'Tenants',             icon: 'user' },
      { to: '/leases',      label: 'Leases',              icon: 'calendar' },
    ]
  },
  { section: 'Finance',
    items: [
      { to: '/financials',     label: 'Financials',         icon: 'trending-up' },
      { to: '/reconciliation', label: 'Reconciliation',     icon: 'refresh-cw' },
      { to: '/depreciation',   label: 'Depreciation',       icon: 'bar-chart-2' },
      { to: '/tax',            label: 'Property tax',        icon: 'file-text' },
    ]
  },
  { section: 'Protection',
    items: [
      { to: '/insurance',   label: 'Insurance',            icon: 'shield' },
    ]
  },
  { section: 'Listings',
    items: [
      { to: '/listings',    label: 'Rental listings',      icon: 'map-pin' },
    ]
  },
  { section: 'Reports',
    items: [
      { to: '/reports',     label: 'Export reports',       icon: 'download' },
    ]
  },
]

// Inline SVG icons (subset of lucide)
const Icon = ({ name, size = 14 }) => {
  const icons = {
    'grid':         <><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></>,
    'home':         <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    'user':         <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    'calendar':     <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    'trending-up':  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    'refresh-cw':   <><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
    'bar-chart-2':  <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    'file-text':    <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
    'shield':       <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    'map-pin':      <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    'download':     <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    'log-out':      <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    'menu':         <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

export default function Layout() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:'system-ui, sans-serif', background:'#f8f7f4' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 0,
        minWidth: sidebarOpen ? 220 : 0,
        transition: 'all 0.2s',
        overflow: 'hidden',
        background: '#fff',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'0.5px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#0c2340' }}>Property DB</div>
          <div style={{ fontSize:11, color:'#888', marginTop:2 }}>
            {user?.email?.split('@')[0]}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:'auto', padding:'8px' }}>
          {NAV.map(section => (
            <div key={section.section} style={{ marginBottom:4 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'#aaa', textTransform:'uppercase',
                letterSpacing:'0.08em', padding:'8px 8px 4px' }}>
                {section.section}
              </div>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}
                  style={({ isActive }) => ({
                    display:'flex', alignItems:'center', gap:8,
                    padding:'7px 10px', borderRadius:8, marginBottom:1,
                    fontSize:12, textDecoration:'none', transition:'background 0.12s',
                    background: isActive ? '#e6f1fb' : 'transparent',
                    color: isActive ? '#185fa5' : '#555',
                    fontWeight: isActive ? 500 : 400,
                  })}>
                  <Icon name={item.icon} size={13} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding:'10px 8px', borderTop:'0.5px solid rgba(0,0,0,0.08)' }}>
          <button onClick={handleSignOut} style={{
            display:'flex', alignItems:'center', gap:8, width:'100%',
            padding:'7px 10px', border:'none', background:'transparent',
            borderRadius:8, fontSize:12, color:'#888', cursor:'pointer',
          }}>
            <Icon name="log-out" size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Top bar */}
        <header style={{
          height:48, display:'flex', alignItems:'center', gap:12,
          padding:'0 20px', background:'#fff',
          borderBottom:'0.5px solid rgba(0,0,0,0.08)', flexShrink:0,
        }}>
          <button onClick={() => setSidebarOpen(o=>!o)} style={{
            border:'none', background:'transparent', cursor:'pointer',
            color:'#888', padding:4, borderRadius:6,
            display:'flex', alignItems:'center',
          }}>
            <Icon name="menu" size={16} />
          </button>
          <span style={{ fontSize:12, color:'#aaa' }}>
            Rental Property Database
          </span>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
