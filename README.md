# Gifted Snapshot

A lightweight tool for gifted & 2e learners to capture strengths, interests, sensitivities, and set enrichment goals.

## Stack & Commands

**Technology Stack:**
- Backend: Node.js + Express (TypeScript)
- Frontend: React + Vite (TypeScript)  
- Database: Supabase Postgres
- Styling: Tailwind CSS (CDN)

### Installation
```bash
npm ci
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start (Production)
```bash
npm run start
```

## Environment Variables Required

Create a `.env` file in the root directory with:

```bash
SUPABASE_URL=https://wktcfhegoxjearpzdxpz.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## API Endpoints

- `GET /api/health` - Health check with Supabase connectivity test
- `GET /api` - API info

## Project Structure

```
/
├── server/           # Express server (TypeScript)
│   ├── index.ts      # Main server entry point
│   └── public/       # Built client assets (populated by build)
├── client/           # React client (Vite + TypeScript)  
│   ├── src/
│   │   ├── main.tsx  # Client entry point
│   │   ├── App.tsx   # Main app component
│   │   └── components/
│   ├── index.html    # HTML template
│   └── vite.config.ts
├── package.json      # Root dependencies & scripts
└── .env              # Environment variables (create from .env.example)
```

## Changes Made

### Purged Stale Artifacts
- Removed `/app/backend/server.py` (FastAPI)
- Removed `/app/backend/requirements.txt` (Python dependencies)
- Removed `/app/backend/.env` (MongoDB config)
- Removed `/app/backend/__pycache__/` (Python cache)

### Created Node/Express + Vite Structure
- Set up Express server with TypeScript (`server/index.ts`)
- Created Vite-based React client (`client/`)
- Configured proper build pipeline (Vite → server/public)
- Added Supabase connectivity with health check
- Set up Tailwind CSS via CDN for quick styling
- Configured TypeScript for both server and client