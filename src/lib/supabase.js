// src/lib/supabase.js
// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a free account
// 2. Create a new project (any name, e.g. "rental-db")
// 3. Go to Settings → API and copy your Project URL and anon/public key
// 4. Replace the two placeholder values below with your real credentials
// 5. Go to the SQL Editor in Supabase and run the schema in supabase-schema.sql
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'   // ← replace this
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'               // ← replace this

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Auth helpers ────────────────────────────────────────────────────────────

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password })

export const signOut = () =>
  supabase.auth.signOut()

export const getUser = () =>
  supabase.auth.getUser()

// ─── Properties ──────────────────────────────────────────────────────────────

export const getProperties = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export const upsertProperty = async (property) => {
  const { data, error } = await supabase
    .from('properties')
    .upsert(property, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

export const deleteProperty = async (id) => {
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}

// ─── Tenants ─────────────────────────────────────────────────────────────────

export const getTenants = async () => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*, properties(address, city)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export const upsertTenant = async (tenant) => {
  const { data, error } = await supabase
    .from('tenants')
    .upsert(tenant, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Leases ──────────────────────────────────────────────────────────────────

export const getLeases = async () => {
  const { data, error } = await supabase
    .from('leases')
    .select('*, properties(address, city), tenants(name)')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data
}

export const upsertLease = async (lease) => {
  const { data, error } = await supabase
    .from('leases')
    .upsert(lease, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = async (filters = {}) => {
  let query = supabase
    .from('transactions')
    .select('*, properties(address)')
    .order('date', { ascending: false })

  if (filters.property_id) query = query.eq('property_id', filters.property_id)
  if (filters.year) query = query.gte('date', `${filters.year}-01-01`).lte('date', `${filters.year}-12-31`)
  if (filters.type) query = query.eq('type', filters.type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const upsertTransaction = async (tx) => {
  const { data, error } = await supabase
    .from('transactions')
    .upsert(tx, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

export const deleteTransaction = async (id) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}

// ─── Capital Expenditures / Depreciation ─────────────────────────────────────

export const getCapex = async () => {
  const { data, error } = await supabase
    .from('capital_expenditures')
    .select('*, properties(address)')
    .order('placed_in_service', { ascending: false })
  if (error) throw error
  return data
}

export const upsertCapex = async (capex) => {
  const { data, error } = await supabase
    .from('capital_expenditures')
    .upsert(capex, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Property Tax Records ─────────────────────────────────────────────────────

export const getPropertyTax = async () => {
  const { data, error } = await supabase
    .from('property_tax')
    .select('*, properties(address, city)')
    .order('tax_year', { ascending: false })
  if (error) throw error
  return data
}

export const upsertPropertyTax = async (record) => {
  const { data, error } = await supabase
    .from('property_tax')
    .upsert(record, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Insurance ────────────────────────────────────────────────────────────────

export const getInsurance = async () => {
  const { data, error } = await supabase
    .from('insurance_policies')
    .select('*, properties(address, city)')
    .order('renewal_date', { ascending: true })
  if (error) throw error
  return data
}

export const upsertInsurance = async (policy) => {
  const { data, error } = await supabase
    .from('insurance_policies')
    .upsert(policy, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Insurance Claims ─────────────────────────────────────────────────────────

export const getClaims = async () => {
  const { data, error } = await supabase
    .from('insurance_claims')
    .select('*, insurance_policies(insurer, policy_number), properties(address)')
    .order('claim_date', { ascending: false })
  if (error) throw error
  return data
}

export const upsertClaim = async (claim) => {
  const { data, error } = await supabase
    .from('insurance_claims')
    .upsert(claim, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export const getListings = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select('*, properties(address, city)')
    .order('listed_date', { ascending: false })
  if (error) throw error
  return data
}

export const upsertListing = async (listing) => {
  const { data, error } = await supabase
    .from('listings')
    .upsert(listing, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

export const getInquiries = async () => {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, listings(property_id), properties(address)')
    .order('inquiry_date', { ascending: false })
  if (error) throw error
  return data
}

export const upsertInquiry = async (inquiry) => {
  const { data, error } = await supabase
    .from('inquiries')
    .upsert(inquiry, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}

// ─── Documents ────────────────────────────────────────────────────────────────

export const uploadDocument = async (file, path) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file, { upsert: true })
  if (error) throw error
  return data
}

export const getDocumentUrl = (path) => {
  const { data } = supabase.storage.from('documents').getPublicUrl(path)
  return data.publicUrl
}

export const getDocuments = async (entityType, entityId) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('uploaded_at', { ascending: false })
  if (error) throw error
  return data
}

export const saveDocumentRecord = async (doc) => {
  const { data, error } = await supabase
    .from('documents')
    .upsert(doc, { onConflict: 'id' })
    .select()
  if (error) throw error
  return data[0]
}
