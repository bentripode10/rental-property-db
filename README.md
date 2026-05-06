# Rental Property Database — Setup Guide

## What's in this package

A complete React web application with:
- User authentication (login / sign up)
- Portfolio dashboard with live KPIs
- Properties, tenants, and leases management
- Financials and reconciliation (Schedule E)
- Depreciation and cost basis tracking
- Property tax tracker
- Insurance tracker
- Rental listing manager
- Excel and PDF report exports

---

## Step 1 — Set up Supabase (your database + auth)

Supabase is a free, open-source backend. The free tier handles up to 500MB and 50,000 monthly active users.

1. Go to **https://supabase.com** and create a free account
2. Click **New project**
   - Name: `rental-property-db` (or anything you like)
   - Database password: choose a strong password and save it
   - Region: US East (or closest to you)
   - Click **Create new project** — takes ~1 minute
3. Once created, go to **Settings → API**
   - Copy your **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - Copy your **anon / public key** (long string starting with `eyJ...`)
4. Open `src/lib/supabase.js` and replace:
   ```js
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'   // ← paste here
   const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'               // ← paste here
   ```

---

## Step 2 — Run the database schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase-schema.sql` from this package
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** (green button)
6. You should see "Success" — all tables are now created

### Create the documents storage bucket
1. Go to **Storage** in the left sidebar
2. Click **New bucket**
   - Name: `documents`
   - Public: **OFF** (keep private)
   - Click **Save**

---

## Step 3 — Run the app locally

You need Node.js installed. Download from https://nodejs.org (LTS version).

```bash
# 1. Open a terminal and go to the project folder
cd rental-property-db

# 2. Install dependencies (takes 1-2 minutes)
npm install

# 3. Start the development server
npm start
```

Your browser will open to `http://localhost:3000`.
Click **Create one** to create your account, then sign in.

---

## Step 4 — Deploy to the web (access from any device)

We recommend **Vercel** — it's free and takes about 5 minutes.

1. Go to **https://vercel.com** and create a free account (sign up with GitHub)
2. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/rental-property-db.git
   git push -u origin main
   ```
3. In Vercel, click **Add New → Project**
4. Import your GitHub repository
5. Add environment variables (click **Environment Variables**):
   - `REACT_APP_SUPABASE_URL` = your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy** — your app is live in ~2 minutes
7. Vercel gives you a URL like `rental-property-db.vercel.app`

> **Optional:** Update `src/lib/supabase.js` to use environment variables:
> ```js
> const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
> const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY
> ```
> This keeps your credentials out of the code.

---

## Step 5 — Add your first real property

1. Sign in to your app
2. Click **Properties** in the left sidebar
3. Click **+ Add property**
4. Fill in your property details:
   - Street address, city, state, ZIP
   - Purchase price and date (from your closing disclosure)
   - Land value (from county appraisal district or closing disclosure)
   - Bedrooms, bathrooms, square footage
5. Click **Save property**

Repeat for all three properties. Then add tenants and leases under those respective pages.

---

## Step 6 — Invite your CPA or property manager

1. In Supabase, go to **Authentication → Users**
2. Click **Invite user** and enter their email
3. They'll receive a signup link and can create their own password
4. They'll see only their own data (Row Level Security enforces this)

> **Note:** Currently each user sees only data they enter. To share data between accounts (e.g. you and your CPA both see your properties), a small schema change is needed — ask your developer to add a `team_id` to the RLS policies.

---

## Pages still to be fully built

The following pages are scaffolded with stub content and need their full UI built out. All database functions are ready in `src/lib/supabase.js`. Use the interactive designs from your Claude conversation as the specification:

- `src/pages/TenantsPage.js`
- `src/pages/LeasesPage.js`
- `src/pages/FinancialsPage.js`
- `src/pages/ReconciliationPage.js`
- `src/pages/DepreciationPage.js`
- `src/pages/PropertyTaxPage.js`
- `src/pages/InsurancePage.js`
- `src/pages/ListingsPage.js`
- `src/pages/ReportsPage.js`
- `src/pages/PropertyDetail.js`

A developer can build each page by referencing the Claude-designed widget for that section and wiring it to the Supabase functions already written.

---

## Estimated developer time to complete

| Task | Est. hours |
|------|-----------|
| Supabase setup + schema (done for you) | 0 |
| All stub pages → full UI | 20–30 hrs |
| CSV import for reconciliation | 4–6 hrs |
| PDF/Excel export (reports page) | 6–8 hrs |
| File upload for receipts/documents | 3–4 hrs |
| Testing and polish | 6–8 hrs |
| **Total** | **~40–56 hrs** |

At a typical freelance rate of $75–125/hr, expect $3,000–7,000 to complete the full application. Post the project on Upwork or Toptal with this repository as the specification.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Router |
| Styling | Inline CSS (no build tools needed) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| File storage | Supabase Storage |
| Hosting | Vercel (free tier) |
| Reports | SheetJS (Excel) + jsPDF (PDF) |

---

## Support

If you get stuck on any step, paste the error message into a Claude conversation and ask for help. Common issues:

- **"Invalid API key"** → double-check the anon key in supabase.js
- **"relation does not exist"** → the schema SQL didn't fully run; run it again
- **Blank white screen** → open browser dev tools (F12) and check the Console tab for errors
- **Can't sign in after creating account** → check Supabase Authentication → Settings and make sure "Enable email confirmations" is set to your preference
