// src/App.js
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage          from './pages/LoginPage'
import Layout             from './components/Layout'
import PortfolioDashboard from './pages/PortfolioDashboard'
import PropertiesPage     from './pages/PropertiesPage'
import {
  PropertyDetail, TenantsPage, LeasesPage, FinancialsPage,
  ReconciliationPage, DepreciationPage, PropertyTaxPage,
  InsurancePage, ListingsPage, ReportsPage,
} from './pages/stubs'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-screen">Loading…</div>
  if (!user)   return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index                  element={<PortfolioDashboard />} />
            <Route path="properties"      element={<PropertiesPage />} />
            <Route path="properties/:id"  element={<PropertyDetail />} />
            <Route path="tenants"         element={<TenantsPage />} />
            <Route path="leases"          element={<LeasesPage />} />
            <Route path="financials"      element={<FinancialsPage />} />
            <Route path="reconciliation"  element={<ReconciliationPage />} />
            <Route path="depreciation"    element={<DepreciationPage />} />
            <Route path="tax"             element={<PropertyTaxPage />} />
            <Route path="insurance"       element={<InsurancePage />} />
            <Route path="listings"        element={<ListingsPage />} />
            <Route path="reports"         element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
