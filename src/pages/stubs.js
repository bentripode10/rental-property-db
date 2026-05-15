// src/pages/stubs.js — placeholder pages for routes not yet built
// Tenants and Leases have been fully built — see their own files
import React from 'react'

const Stub = ({ title, description }) => (
  <div>
    <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:'0 0 8px' }}>{title}</h1>
    <p style={{ fontSize:13, color:'#888', marginBottom:24 }}>{description}</p>
    <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:24, maxWidth:520 }}>
      <div style={{ fontSize:13, color:'#555', lineHeight:1.7 }}>
        This module is ready to be built. All database tables and API functions are already in place in <code>src/lib/supabase.js</code>.
        The UI components from the design prototype are the reference.
      </div>
    </div>
  </div>
)

export const FinancialsPage     = () => <Stub title="Financials"     description="Income, expenses, and P&L by property and portfolio." />
export const ReconciliationPage = () => <Stub title="Reconciliation" description="Upload bank/CC/Venmo CSVs, match transactions, assign Schedule E categories." />
export const DepreciationPage   = () => <Stub title="Depreciation"   description="Cost basis, capital expenditures, and 27.5-year depreciation schedules." />
export const PropertyTaxPage    = () => <Stub title="Property tax"   description="Assessed values, tax bills, payments, and appeal history." />
export const InsurancePage      = () => <Stub title="Insurance"      description="Policy details, coverage limits, premiums, and claims." />
export const ListingsPage       = () => <Stub title="Listings"       description="Listing copy, platform tracker, market pricing, and inquiry log." />
export const ReportsPage        = () => <Stub title="Reports"        description="Export portfolio, Schedule E, depreciation, and tax reports to Excel and PDF." />
export const PropertyDetail     = () => <Stub title="Property detail" description="Full detail view for a single property with all tabs." />
