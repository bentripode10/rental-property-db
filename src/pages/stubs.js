// src/pages/stubs.js — placeholder pages for every route
// Each will be built out with full functionality in subsequent development
import React from 'react'
import { Link } from 'react-router-dom'

const Stub = ({ title, description, buildNext }) => (
  <div>
    <h1 style={{ fontSize:20, fontWeight:600, color:'#0c2340', margin:'0 0 8px' }}>{title}</h1>
    <p style={{ fontSize:13, color:'#888', marginBottom:24 }}>{description}</p>
    <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.08)', borderRadius:12, padding:24, maxWidth:520 }}>
      <div style={{ fontSize:13, color:'#555', lineHeight:1.7 }}>
        This module is ready to be built. All database tables and API functions are already in place in <code>src/lib/supabase.js</code>. 
        The UI components from the design prototype are the reference.
      </div>
      {buildNext && (
        <div style={{ marginTop:16, fontSize:12, color:'#aaa' }}>
          Build next: {buildNext}
        </div>
      )}
    </div>
  </div>
)

export const TenantsPage      = () => <Stub title="Tenants"          description="Tenant contact info, move-in dates, and emergency contacts." buildNext="getTenants(), upsertTenant() — see supabase.js" />
export const LeasesPage       = () => <Stub title="Leases"           description="Lease terms, dates, rent amounts, and renewal tracking." />
export const FinancialsPage   = () => <Stub title="Financials"       description="Income, expenses, and P&L by property and portfolio." />
export const ReconciliationPage = () => <Stub title="Reconciliation" description="Upload bank/CC/Venmo CSVs, match transactions, assign Schedule E categories." />
export const DepreciationPage = () => <Stub title="Depreciation"     description="Cost basis, capital expenditures, and 27.5-year depreciation schedules." />
export const PropertyTaxPage  = () => <Stub title="Property tax"     description="Assessed values, tax bills, payments, and appeal history." />
export const InsurancePage    = () => <Stub title="Insurance"        description="Policy details, coverage limits, premiums, and claims." />
export const ListingsPage     = () => <Stub title="Listings"         description="Listing copy, platform tracker, market pricing, and inquiry log." />
export const ReportsPage      = () => <Stub title="Reports"          description="Export portfolio, Schedule E, depreciation, and tax reports to Excel and PDF." />
export const PropertyDetail   = () => <Stub title="Property detail"  description="Full detail view for a single property with all tabs." />
