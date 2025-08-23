# My IEP Hero - Gifted Snapshot

A comprehensive tool for gifted & special education support, featuring the **Gifted Snapshot** module for capturing student strengths, enrichment goals, and resources.

## Stack & Commands

**Technology Stack:**
- Backend: Node.js + Express (TypeScript)
- Frontend: React + Vite (TypeScript)  
- Database: Supabase Postgres with Row Level Security (RLS)
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

## Project Structure

```
/
├── server/           # Express server (TypeScript)
│   ├── index.ts      # Main server entry point
│   ├── routes/
│   │   └── gifted.ts # Gifted Snapshot API routes
│   └── public/       # Built client assets (populated by build)
├── client/           # React client (Vite + TypeScript)  
│   ├── src/
│   │   ├── main.tsx  # Client entry point
│   │   ├── App.tsx   # Main app component with navigation
│   │   ├── pages/
│   │   │   └── GiftedDashboard.tsx # Main Gifted Snapshot interface
│   │   ├── api/
│   │   │   └── gifted.ts # API client functions
│   │   ├── types/
│   │   │   └── gifted.ts # TypeScript type definitions
│   │   └── components/
│   │       └── Home.tsx
│   ├── index.html    # HTML template with Tailwind CDN
│   └── vite.config.ts
├── package.json      # Root dependencies & scripts
├── database_schema.sql # Supabase database schema
└── .env              # Environment variables (create from example)
```

## Features

### 🎯 Gifted Snapshot Module

A comprehensive tool for parents and advocates to document and track gifted learner profiles:

**Core Features:**
- **Strength Profiles**: Document student strengths by domain (Math, Language Arts, STEM, etc.)
- **Enrichment Goals**: Set and track learning objectives with progress monitoring
- **Resource Library**: Curate links and files for educational materials
- **Collaborative Comments**: Allow communication between parents and advocates

**Access Control:**
- **Parents**: Full access to their own students' data
- **Advocates**: Access to assigned parents' students via assignments table
- **RLS Enforcement**: Database-level security ensures proper data isolation

## API Endpoints

### Core System
- `GET /api/health` - Health check with Supabase connectivity test
- `GET /api` - API info

### Gifted Snapshot (`/api/gifted/*`)
All endpoints require `Authorization: Bearer <jwt>` header.

**Profiles:**
- `GET /api/gifted/profiles?studentId=uuid` - Get strength profiles for a student
- `POST /api/gifted/profiles` - Create new strength profile

**Goals:**
- `GET /api/gifted/goals?studentId=uuid` - Get enrichment goals for a student  
- `POST /api/gifted/goals` - Create new enrichment goal
- `PATCH /api/gifted/goals/:id` - Update existing goal

**Resources:**
- `GET /api/gifted/resources?studentId=uuid` - Get resources for a student
- `POST /api/gifted/resources` - Add new resource (link or file)

**Comments:**
- `GET /api/gifted/comments?goalId=uuid` - Get comments for a goal
- `POST /api/gifted/comments` - Add comment to a goal

**Helpers:**
- `GET /api/gifted/students` - Get accessible students for current user

## Database Setup

### 1. Execute Schema
Run the SQL in `database_schema.sql` in your Supabase SQL Editor to create:
- **Tables**: `gifted_profiles`, `gifted_goals`, `gifted_resources`, `gifted_comments`
- **RLS Policies**: Enforce parent/advocate access controls
- **Helper Functions**: `is_advocate_of()`, `student_owner()`, etc.
- **Storage Bucket**: `gifted-resources` for file uploads

### 2. Required Existing Tables
The schema assumes these tables already exist (adapt as needed):
- `profiles(id uuid, role text, email text)` - User profiles
- `students(id uuid, name text, parent_id uuid)` - Student records
- `assignments(id uuid, parent_id uuid, advocate_id uuid)` - Parent-advocate assignments

## Usage

### For Parents
1. Navigate to **Gifted Snapshot** from the main navigation
2. Select your student from the dropdown
3. Use the tabs to:
   - **Strength Profiles**: Document areas of giftedness with specific evidence
   - **Enrichment Goals**: Set learning objectives and track progress
   - **Resources**: Curate helpful materials and links
   - **Comments**: Collaborate with advocates on goals

### For Advocates  
1. Access assigned parents' students automatically
2. View all student data for assigned families
3. Add comments and collaborate on goals
4. Monitor progress across multiple students

## How to Test

### Prerequisites
1. **Database Setup**: Execute `database_schema.sql` in Supabase
2. **Environment**: Set up `.env` with valid Supabase credentials
3. **Authentication**: Have valid JWT tokens for testing

### Manual Testing
```bash
# Health check (no auth required)
curl -sS http://localhost:3001/api/health | jq .

# With valid Supabase JWT
PJWT="<paste_your_jwt_token>"
BASE="http://localhost:3001"

# List accessible students
curl -sS -H "Authorization: Bearer $PJWT" "$BASE/api/gifted/students" | jq .

# Get profiles for a student
curl -sS -H "Authorization: Bearer $PJWT" "$BASE/api/gifted/profiles?studentId=<uuid>" | jq .

# Create a new goal
curl -sS -X POST -H "Authorization: Bearer $PJWT" -H "Content-Type: application/json" \
  -d '{"student_id":"<uuid>","title":"Advanced Math Track","status":"active"}' \
  "$BASE/api/gifted/goals" | jq .
```

### UI Testing
1. Navigate to `http://localhost:3001`
2. Click "Gifted Snapshot" in navigation
3. Select a student (requires authentication)
4. Test all tabs: Profiles, Goals, Resources, Comments
5. Create sample data in each section
6. Verify RLS by switching between parent/advocate tokens

## Changes Made

### Migration from FastAPI + MongoDB
- **Removed**: All Python/FastAPI/MongoDB artifacts
- **Added**: Complete Node/Express + Vite + Supabase architecture
- **Enhanced**: Full TypeScript support with type safety
- **Improved**: Modern React patterns with hooks and context

### Gifted Snapshot Implementation
- **Database**: 4 new tables with comprehensive RLS policies
- **API**: 8 new endpoints with full validation and error handling  
- **UI**: Tabbed dashboard with modal forms and real-time updates
- **Security**: JWT-based authentication with Supabase RLS enforcement

### Build Pipeline
- **Vite**: Modern build system with fast HMR
- **TypeScript**: Full type safety across frontend and backend
- **Tailwind**: Utility-first CSS with CDN for rapid styling
- **Express**: Static file serving with SPA fallback

## Screenshots

### Homepage
![Homepage with navigation showing My IEP Hero branding and feature cards]

### Gifted Dashboard  
![Gifted Snapshot dashboard with tabbed interface for managing student profiles]

*Note: Screenshots show the styled interface with proper Tailwind CSS rendering and responsive design.*

---

**Version**: 1.0.0  
**License**: Private  
**Support**: Built for My IEP Hero platform